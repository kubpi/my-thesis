import Modal from "react-modal";
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const LoginModal = ({
  isOpen,
  onRequestClose,
  onRegisterClick,
  onForgotPasswordClick,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const auth = getAuth();
  const firestore = getFirestore();
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email) {
      // Check if email state is not empty
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
          console.error("Error sending password reset email:", error);
        });
    } else {
      alert("Please enter your email address first.");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateForm(e.target.value, password);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validateForm(email, e.target.value);
  };

  const validateForm = (email, password) => {
    // Simple validation check
    const isValid = email.length > 0 && password.length > 0;
    setIsFormValid(isValid);
  };


  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        // This would be triggered after a user registers/logs in and we have their user UID
        const createUserProfile = async (userAuth) => {
          const userRef = doc(firestore, "users", userAuth.uid);

          const userProfile = {
            displayName: userAuth.displayName || userAuth.email.split("@")[0], // Default to part of the email if no displayName
            email: userAuth.email,
            createdAt: new Date(), // Store the timestamp of when the user was created
            // ... any other fields you'd like to include
          };

          await setDoc(userRef, userProfile);
        };

        // This function would need to be called after user registration/login
        if (auth.currentUser) {
          createUserProfile(auth.currentUser)
            .then(() => {
              console.log("User profile created/updated in Firestore.");
            })
            .catch((error) => {
              console.error("Error creating user profile: ", error);
            });
        }
        onRequestClose(); // Close the modal on successful sign in
      })
      .catch((error) => {
        console.error("Error signing in with Google:", error);
      });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (isFormValid) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
         
          onRequestClose(); // Close the modal on successful login
        })
        .catch((error) => {
          console.error("Error signing in with email and password:", error);
        });
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="close-button">
        &times;
      </button>
      <h2 className="login-header">Zaloguj się na istniejącym koncie</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="submit" disabled={!isFormValid}>
          Zaloguj się
        </button>
      </form>
      <button type="submit" onClick={signInWithGoogle}>Sign in with Google</button>
      <div className="login-help-links">
        <a href="#" onClick={handleForgotPassword}>
          Zapomniałeś(aś) hasła?
        </a>
        <span> albo </span>
        <a href="#" onClick={onRegisterClick}>
          Nie posiadasz konta? Zarejestruj się
        </a>
      </div>
    </Modal>
  );
};

export default LoginModal;

import { useState } from "react";
import Modal from "react-modal";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const auth = getAuth();
  const firestore = getFirestore();

  const handleRegister = (e) => {
    e.preventDefault();
    if (validateEmail(email) && validatePassword() && isFormValid()) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert("Udało się zarejestrować");
          const createUserProfile = async (userAuth) => {
            const userRef = doc(firestore, "users", userAuth.uid);
            const userProfile = {
              displayName: userAuth.displayName || userAuth.email.split("@")[0],
              createdAt: new Date(),
            };

            await setDoc(userRef, userProfile);
          };

          if (auth.currentUser) {
            createUserProfile(auth.currentUser)
              .then(() => {
                console.log("User profile created/updated in Firestore.");
              })
              .catch((error) => {
                console.error("Error creating user profile: ", error);
              });
          }
          onRequestClose();
          resetForm();
        })
        .catch((error) => {
          console.error("Error during registration:", error);
          setRegisterError(
            "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."
          );
        });
    }
  };

  const validateEmail = (email) => {
    if (!email.includes("@")) {
      setEmailError("Nieprawidłowy format e-maila.");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Hasła nie są identyczne.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };


  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
  };

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === "email") {
      setEmail(value);
      if (!value.includes("@")) {
        setEmailError("Nieprawidłowy format e-maila.");
      } else {
        setEmailError("");
      }
    } else if (type === "password") {
      setPassword(value);
    } else if (type === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const isFormValid = () => {
    return (
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword &&
      email.includes("@") &&
      registerError === ""
    );
  };
  

  const closeButtonFun = function () {
    resetForm();
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeButtonFun}
      contentLabel="Register Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={closeButtonFun} className="close-button">&times;</button>
      <h2 className="login-header">Załóż nowe konto</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleInputChange(e, 'email')}
        />
        {emailError && <div className="email-error-message">{emailError}</div>}
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => handleInputChange(e, 'password')}
        />
        <input
          type="password"
          placeholder="Potwierdź hasło"
          value={confirmPassword}
          onChange={(e) => handleInputChange(e, 'confirmPassword')}
        />
        {passwordError && <div className="password-error-message">{passwordError}</div>}
        <button type="submit" disabled={!isFormValid()}>Zarejestruj się</button>
        {registerError && <div className="register-error-message">{registerError}</div>}
      </form>
    </Modal>
  );
};

export default RegisterModal;

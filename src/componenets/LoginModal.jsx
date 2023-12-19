import React from 'react';
import Modal from 'react-modal';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
const LoginModal = ({ isOpen, onRequestClose, onRegisterClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

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

  const auth = getAuth();

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(() => {
      onRequestClose(); // Close the modal on successful sign in
    }).catch((error) => {
      console.error('Error signing in with Google:', error);
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
          console.error('Error signing in with email and password:', error);
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
      <button onClick={onRequestClose} className="close-button">&times;</button>
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
        <button type="submit" disabled={!isFormValid}>Zaloguj się</button>
      </form>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <div className="login-help-links">
        <a href="#" onClick={onForgotPasswordClick}>Zapomniałeś(aś) hasła?</a>
        <span> albo </span>
        <a href="#" onClick={onRegisterClick}>Nie posiadasz konta? Zarejestruj się</a>
      </div>
    </Modal>
  );
};

export default LoginModal;

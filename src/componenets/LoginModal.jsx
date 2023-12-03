import React from 'react';
import Modal from 'react-modal';
import { useState } from 'react';
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
      <form>
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
      <div className="login-help-links">
        <a href="#" onClick={onForgotPasswordClick}>Zapomniałeś(aś) hasła?</a>
        <span> albo </span>
        <a href="#" onClick={onRegisterClick}>Nie posiadasz konta? Zarejestruj się</a>
      </div>
    </Modal>
  );
};

export default LoginModal;

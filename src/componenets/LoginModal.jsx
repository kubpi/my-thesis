import React from 'react';
import Modal from 'react-modal';

const LoginModal = ({ isOpen, onRequestClose, onRegisterClick, onForgotPasswordClick }) => {
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
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Hasło" />
        <button type="submit">Zaloguj się</button>
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

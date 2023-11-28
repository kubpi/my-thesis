import React from 'react';
import Modal from 'react-modal';
import "./login.css";
const RegisterModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Register Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="close-button">&times;</button>
      <h2>Zarejestruj się</h2>
      <form>
        <input type="text" placeholder="Nazwa użytkownika" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Hasło" />
        <input type="password" placeholder="Potwierdź hasło" />
        <button type="submit">Zarejestruj się</button>
      </form>
    </Modal>
  );
};

export default RegisterModal;

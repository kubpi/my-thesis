import Modal from 'react-modal';
import "./login.css";
const LoginModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={onRequestClose} className="close-button">&times;</button>
      <h2>Zaloguj się na istniejącym koncie</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Hasło" />
        <button type="submit">Zaloguj się</button>
      </form>
    </Modal>
  );
};

export default LoginModal;

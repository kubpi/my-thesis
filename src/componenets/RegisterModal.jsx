import { useState } from 'react';
import Modal from 'react-modal';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(''); // State to hold the email error message
  // Function to validate the email

  const auth = getAuth();

  const handleRegister = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert("Udało się zarejestrować");
          onRequestClose(); // Close the modal on successful registration
          resetForm();
        })
        .catch((error) => {
          console.error('Error during registration:', error);
        });
    }
  };

  const validateEmail = (email) => {
    if (!email.includes('@')) {
      setEmailError('Uwzględnij znak "@" w adresie e-mail. W adresie brakuje znaku "@"');
    } else {
      setEmailError(''); // Clear the error if the email is valid
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
  };
  
  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'email') {
      setEmail(value);
      validateEmail(value); // Validate email when it changes
    } else {
      type === 'password' ? setPassword(value) :
      setConfirmPassword(value);
    }
  };

  // Function to validate the whole form
  const isFormValid = () => {
    // More complex validation can be added here
    return email.length > 0 &&
           password.length > 0 &&
           password === confirmPassword &&
           emailError === ''; // Form is valid only if there is no email error
  };

  const closeButtonFun = function () {
    resetForm()
    onRequestClose()
    
  }

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
        {emailError && <div className="email-error-message">{emailError}</div>} {/* Display email error message */}
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
        <button type="submit" disabled={!isFormValid()}>Zarejestruj się</button>
      </form>
    </Modal>
  );
};

export default RegisterModal;

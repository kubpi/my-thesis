import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useEffect } from 'react';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(''); // State to hold the email error message
  const [apiError, setApiError] = useState(''); // State to hold API error messages
  // Function to validate the email
  const validateEmail = (email) => {
    if (!email.includes('@')) {
      setEmailError('Uwzględnij znak "@" w adresie e-mail. W adresie brakuje znaku "@"');
    } else {
      setEmailError(''); // Clear the error if the email is valid
    }
  };
  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setApiError('');
  };
  
  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'email') {
      setEmail(value);
      validateEmail(value); // Validate email when it changes
    } else {
      type === 'username' ? setUsername(value) :
      type === 'password' ? setPassword(value) :
      setConfirmPassword(value);
    }
  };

  // Function to validate the whole form
  const isFormValid = () => {
    // More complex validation can be added here
    return username.length > 0 &&
           email.length > 0 &&
           password.length > 0 &&
           password === confirmPassword &&
           emailError === ''; // Form is valid only if there is no email error
  };

// Add useEffect to set base URL for API requests
useEffect(() => {
  axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
}, []);

const handleRegister = async (e) => {
  e.preventDefault();
  if (isFormValid()) {
    try {
      const response = await axios.post('/account/register/', {
        username,
        email,
        password,
        password2: confirmPassword,
      });
      console.log(response.data); // Handle success
      if (response.data.username.includes("A user with that username already exists.")) {
        alert("A user with that username already exists.")
      } else {
        alert("Udało się zarejestrować")
        onRequestClose(); // Close the modal if registration is successful
        resetForm();
      }
      
      
    } catch (error) {
      // Check if the error response is in the expected format
      if (error.response && error.response.data) {
        // Check for the specific error messages and display them
        if (error.response.data.Error === "Email already exists") {
          alert("Email already exists");
        } else {
          // If there's an error but it doesn't match the expected format, log it to the console
          console.error("An unexpected error occurred:", error.response.data);
        }
      } else {
        // If the error doesn't even have a response, it's likely a network error
        console.error("A network error occurred:", error);
      }
    }
  }
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
          type="text"
          placeholder="Nazwa użytkownika"
          value={username}
          onChange={(e) => handleInputChange(e, 'username')}
        />
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
      {/* ... */}
    </Modal>
  );
};

export default RegisterModal;

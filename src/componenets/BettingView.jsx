// BettingView.js

import React from 'react';
import FavoriteMatches from './FavoriteMatches'; // Make sure this import path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './BettingView.css';


const BettingView = ({ isOpen, onClose,onAddTab  }) => {
    const [tabName, setTabName] = React.useState('');

    if (!isOpen) return null;
  
    const handleSubmit = (e) => {
      e.preventDefault(); // Prevent default form submission behavior
      if (tabName.trim()) {
        onAddTab(tabName.trim());
        setTabName('');
        onClose();
      } else {
        alert("Tab name cannot be empty.");
      }
    };

  return (
    <div className="modal-backdrop">
          <div className="modal-content">
          <h2>Betting View</h2>
        <input
          type="text"
          placeholder="Tab name"
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
        />
        <button onClick={handleSubmit}>Add</button>
        <button onClick={onClose}>Cancel</button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
       
        <FavoriteMatches />
      </div>
    </div>
  );
};

export default BettingView;


  

  
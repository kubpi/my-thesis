import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './RemoveButton.css'; // We will create this CSS file

const RemoveButton = ({ onClick }) => {
  return (
    <button className="remove-button" onClick={onClick}>
      <FontAwesomeIcon icon={faTrash} />
      <span>Remove</span>
    </button>
  );
};

export default RemoveButton;

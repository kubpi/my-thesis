import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './BettingMatches.css';

const MatchInputView = ({ isOpen, match, onClose, onSubmitScore }) => {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  if (!isOpen || !match) return null;

  const handleSubmit = () => {
    if (onSubmitScore) {
      onSubmitScore(match.id, homeScore, awayScore);
    }
    onClose();
  };
console.log(match)
  return (
    <div className="modal-backdrop">
     <div className="modal-content">
        <h2>Obstaw wynik meczu</h2>
        <div className="match-details">
          <span>{match.homeTeam.name}</span>
          <input 
            type="text" 
            placeholder="Wynik" 
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Wynik" 
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
          />
          <span>{match.awayTeam.name}</span>
        </div>

        <button onClick={handleSubmit}>Zapisz</button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default MatchInputView;

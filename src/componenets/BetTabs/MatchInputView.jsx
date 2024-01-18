import  { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/MatchInputView.css";

const MatchInputView = ({ isOpen, match, onClose, onSubmitScore }) => {
  const [homeScore, setHomeScore] = useState(null);
  const [awayScore, setAwayScore] = useState(null);
  const [homeTeamLogo, setHomeTeamLogo] = useState('');
  const [awayTeamLogo, setAwayTeamLogo] = useState('');

  useEffect(() => {
    // Assuming you have the team logos stored with the team ID as the key
    const storedLogos = JSON.parse(localStorage.getItem('teamsLogos')) || {};
    if (match) {
      setHomeTeamLogo(storedLogos[match.homeTeam.id]);
      setAwayTeamLogo(storedLogos[match.awayTeam.id]);
    }
  }, [match]);

  console.log(match);
  if (!isOpen || !match) return null;

  const handleSubmit = () => {
    if (onSubmitScore) {
      onSubmitScore(match.id, homeScore, awayScore);
    }
    onClose();
  };

  const renderGoalOptions = () => {
    const options = [];
    for (let i = 0; i <= 10; i++) {
      if (i === 0) {
        options.push(<option>Brak</option>);
      }
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Obstaw wynik meczu</h2>
        <div className="match-details">
          <div className="team-score-input">
            <div>
              <img
                src={homeTeamLogo}
                className="team-logo3"
                alt={match.homeTeam.name}
              />
              {match.homeTeam.name}
            </div>
            <select
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
            >
              {renderGoalOptions()}
            </select>
          </div>
          <div className="team-score-input">
            <div>
              <img
                src={awayTeamLogo}
                className="team-logo3"
                alt={match.awayTeam.name}
              />
              {match.awayTeam.name}
            </div>
            <select
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
            >
              {renderGoalOptions()}
            </select>
          </div>
        </div>

        <button className="saveButton" onClick={handleSubmit}>
          Zapisz
        </button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default MatchInputView;

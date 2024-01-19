import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import "../../css/GameModeView.css";

const GameModeView = ({ isOpen, onClose, onSelectSolo, onSelectTeam }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="game-mode-content">
        <h2>Wybierz tryb gry</h2>

        <div className="game-mode-buttons">
          <button className="game-mode-button solo" onClick={onSelectSolo}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            Gram pomiędzy wszystkimi użytkownikami
          </button>
          <button className="game-mode-button team" onClick={onSelectTeam}>
            <FontAwesomeIcon icon={faUsers} className="icon" />
            Gram ze znajomymi
          </button>
        </div>

        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default GameModeView;

GameModeView.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSelectSolo: PropTypes.func,
  onSelectTeam: PropTypes.func,
};

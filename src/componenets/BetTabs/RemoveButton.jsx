import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../css/RemoveButton.css"; // We will create this CSS file

const RemoveButton = ({ onClick }) => {
  return (
    <button className="remove-button" onClick={onClick}>
      <FontAwesomeIcon icon={faTrash} />
      <span>Usuń</span>
    </button>
  );
};

export default RemoveButton;

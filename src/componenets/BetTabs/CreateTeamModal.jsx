import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/CreateTeamModal.css";
import { getAuth } from "firebase/auth";

const CreateTeamModal = ({ isOpen, onClose, onUsersSelected }) => {
  const auth = getAuth();
  const loggedInUserId = auth.currentUser;
  console.log(loggedInUserId);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setErrorMessage("");
  };

  const firestore = getFirestore();

  const handleSearch = async () => {
    const usersRef = collection(firestore, "users");
    const field = searchTerm.includes("@") ? "email" : "displayName";
    const searchQuery = query(
      usersRef,
      where(field, "==", searchTerm),
      where(field, "!=", loggedInUserId.displayName || loggedInUserId.email)
    );

    try {
      const querySnapshot = await getDocs(searchQuery);
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      if (users.length === 0) {
        setErrorMessage("Dany użytkownik nie został znaleziony.");
        setShowErrorModal(true);
      } else {
        setSearchResults(users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddUserToTab = (user) => {
    setSelectedUsers((prevUsers) => {
      if (prevUsers.find((u) => u.uid === user.uid)) {
        return prevUsers;
      }
      setSearchTerm("");
      setSearchResults([]);
      return [...prevUsers, user];
    });
  };

  const handleCreateTab = () => {
    if (selectedUsers.length === 0 && loggedInUserId) {
      setErrorMessage("Please select at least one friend to create a tab.");
      setShowErrorModal(true);
      return;
    } else if (selectedUsers.length > 0) {
      const updatedSelectedUsers = selectedUsers.map((user) => ({
        uid: user.uid,
        displayName: user.displayName || user.email,
      }));

      if (!updatedSelectedUsers.some((user) => user.uid === loggedInUserId)) {
        updatedSelectedUsers.push({
          uid: loggedInUserId?.uid,
          displayName: loggedInUserId.displayName || loggedInUserId.email,
        });
      }
      onUsersSelected(updatedSelectedUsers);
      onClose();
    }
  };

  const handleRemoveUserFromTab = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.uid !== userId));
  };

  useEffect(() => {
    setErrorMessage("");
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="create-team-content">
        <h2>Wyszukaj znajomych</h2>
        <input
          type="text"
          placeholder="Wyszukaj znajomych..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <button className="content-button" onClick={handleSearch}>
          Wyszukaj
        </button>
        {showErrorModal && <p>{errorMessage}</p>}
        <div className="search-results">
          <div className="found-users-label">Znalezieni użytkownicy:</div>
          <ul className="user-list">
            {searchResults.map((user) => (
              <li key={user.uid} className="user-list-item">
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <button
                  className="content-button-add-remove"
                  onClick={() => handleAddUserToTab(user)}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="selected-users">
          <div className="selected-users-label">Wybrani rywale:</div>
          <ul className="user-list">
            {selectedUsers.map((user) => (
              <li key={user.uid} className="user-list-item">
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <button
                  className="content-button-remove"
                  onClick={() => handleRemoveUserFromTab(user.uid)}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selectedUsers.length === 0 && (
          <div className="error-message">
            Wybierz przynajmniej jedną osobę do rywalizacji
          </div>
        )}
        <button
          className="content-button"
          onClick={handleCreateTab}
          disabled={selectedUsers.length === 0}
        >
          Utwórz zakład
        </button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default CreateTeamModal;

CreateTeamModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onUsersSelected: PropTypes.func,
};

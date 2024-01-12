import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/CreateTeamModal.css"; // Make sure this path is correct
import { getAuth } from "firebase/auth";

const CreateTeamModal = ({ isOpen, onClose, onCreateTab, onUsersSelected }) => {
  const auth = getAuth();
  const loggedInUserId = auth.currentUser;
  console.log(loggedInUserId);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
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
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddUserToTab = (user) => {
    setSelectedUsers((prevUsers) => {
      if (prevUsers.find((u) => u.uid === user.uid)) {
        return prevUsers; // User is already selected
      }
      setSearchTerm(""); // Clear the search term
      setSearchResults([]); // Clear the search results
      return [...prevUsers, user]; // Add new user to the list
    });
  };

  const handleCreateTab = () => {
    if (selectedUsers.length === 0 && loggedInUserId) {
      // If no users are selected and the current user is logged in
      onUsersSelected([{ uid: loggedInUserId }]);
    } else if (selectedUsers.length > 0) {
      // If users are selected
      const updatedSelectedUsers = selectedUsers.map((user) => ({
        uid: user.uid,
        displayName: user.displayName || user.email, // Include the displayName or email
      }));
      // Add the logged-in user to the list if not already included
      if (!updatedSelectedUsers.some((user) => user.uid === loggedInUserId)) {
        updatedSelectedUsers.push({
          uid: loggedInUserId?.uid,
          displayName: loggedInUserId.displayName || loggedInUserId.email,
        });
      }
      onUsersSelected(updatedSelectedUsers);
    } else {
      // No users selected and no one is logged in
      alert("Please select at least one friend to create a tab.");
    }
  };

  const handleRemoveUserFromTab = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.uid !== userId));
  };

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
        <button className="content-button" onClick={handleCreateTab}>
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

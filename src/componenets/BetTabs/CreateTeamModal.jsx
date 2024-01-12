import  { useState } from "react";
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
    const searchQuery = query(usersRef, where(field, "==", searchTerm));

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
      return [...prevUsers, user]; // Add new user to the list
    });
  };

  const handleCreateTab = () => {
    if (selectedUsers.length === 0 && loggedInUserId) {
      // If no users are selected and the current user is logged in
      onUsersSelected([{ uid: loggedInUserId }]);
    } else if (selectedUsers.length > 0) {
      // If users are selected
      const updatedSelectedUsers = selectedUsers.map(user => ({
        uid: user.uid,
        displayName: user.displayName || user.email // Include the displayName or email
      }));
      // Add the logged-in user to the list if not already included
      if (!updatedSelectedUsers.some(user => user.uid === loggedInUserId)) {
        updatedSelectedUsers.push({ uid: loggedInUserId?.uid, displayName: loggedInUserId.displayName || loggedInUserId.email });
      }
      onUsersSelected(updatedSelectedUsers);
    } else {
      // No users selected and no one is logged in
      alert("Please select at least one friend to create a tab.");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="create-team-content">
        <h2>Wyszukaj znajomych</h2>
        <input
          type="text"
          placeholder="Search for friends..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <button onClick={handleSearch}>Search</button>
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user.uid} className="search-result-item">
              {user.displayName || user.email}
              <button onClick={() => handleAddUserToTab(user)}>+</button>
            </div>
          ))}
        </div>
        <div className="selected-users">
          {selectedUsers.map((user) => (
            <div key={user.uid} className="selected-user-item">
              {user.displayName || user.email}
            </div>
          ))}
        </div>
        <button onClick={handleCreateTab}>Create Tab</button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default CreateTeamModal;

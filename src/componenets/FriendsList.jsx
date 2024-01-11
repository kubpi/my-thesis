import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "../css/FriendsList.css";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  // We use the onAuthStateChanged listener to wait for the user's auth state to resolve
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // Once the user is authenticated, you can access currentUser.uid
        loadFriends(currentUser.uid);
      }
    });
    return unsubscribeAuth; // Unsubscribe from the listener when the component unmounts
  }, [auth]);

  const loadFriends = (userId) => {
    // Assuming you have a 'friendships' collection with 'userId' and 'friendId'
    const friendshipsRef = collection(firestore, "friendships");
    const q = query(friendshipsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friendsData = snapshot.docs.map((doc) => doc.data().friendId);
      // Assuming you have a 'users' collection to fetch friend details
      Promise.all(
        friendsData.map((friendId) => getDoc(doc(firestore, "users", friendId)))
      ).then((friendsDocs) => {
        setFriends(friendsDocs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    });

    return unsubscribe; // Return the unsubscribe function to clean up the listener
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Function to send a friend request
  const sendFriendRequest = async (friendId) => {
    try {
      // Ensure the user is authenticated
      if (auth.currentUser) {
        await addDoc(collection(firestore, "friendRequests"), {
          from: auth.currentUser.uid, // The UID of the current user
          to: friendId, // The UID of the user to send the request to
          status: "pending", // The status of the friend request
          createdAt: new Date(), // The timestamp of the request creation
        });
        console.log("Friend request sent successfully");
      } else {
        console.error("User must be logged in to send friend requests");
      }
    } catch (error) {
      console.error("Error sending friend request: ", error);
    }
  };

  // Function to accept a friend request
  // Function to accept a friend request
  const acceptFriendRequest = async (requestId) => {
    if (!auth.currentUser) {
      console.error("User must be logged in to accept friend requests");
      return;
    }

    // Start by getting the friend request to verify it's to the current user
    const friendRequestRef = doc(firestore, "friendRequests", requestId);
    const friendRequestSnap = await getDoc(friendRequestRef);
    if (!friendRequestSnap.exists()) {
      console.error("Friend request does not exist.");
      return;
    }

    const friendRequestData = friendRequestSnap.data();
    if (friendRequestData.to !== auth.currentUser.uid) {
      console.error(
        "You do not have permission to accept this friend request."
      );
      return;
    }

    try {
      // Update the friendRequests collection to reflect the accepted status
      await updateDoc(friendRequestRef, {
        status: "accepted",
      });

      // Add to the friendships collection
      await addDoc(collection(firestore, "friendships"), {
        userId: auth.currentUser.uid,
        friendId: friendRequestData.from,
      });

      // Here, update your local state to reflect this change
      // This could be a state setter function or a context/dispatch action, depending on your state management
      console.log("Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request: ", error);
    }
  };

  // Function to reject a friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      // Update the friendRequests collection to reflect the rejected status
      const friendRequestRef = doc(firestore, "friendRequests", requestId);
      await updateDoc(friendRequestRef, {
        status: "rejected",
      });

      console.log("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting friend request: ", error);
    }
  };

  // New section to handle displaying incoming friend requests
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(firestore, "friendRequests"),
        where("to", "==", auth.currentUser.uid),
        where("status", "==", "pending")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const requests = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setIncomingRequests(requests);
        },
        (error) => {
          console.error("Error fetching incoming friend requests:", error);
        }
      );

      return unsubscribe;
    }
  }, [firestore, auth.currentUser]);
  const handleSearch = async () => {
    const searchField = searchTerm.includes("@") ? "email" : "displayName";
    const searchValue = searchTerm.toLowerCase(); // Convert search term to lowercase

    // Note: Firestore does not support case-insensitive searches natively,
    // so we would need to ensure that the user's input and the data in the Firestore
    // are formatted the same way (either both in lowercase or both in original case).
    // The following query will perform a case-sensitive search.
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where(searchField, "==", searchValue));

    try {
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setSearchResults(users); // Update the state with the search results
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Make sure to check if the user is authenticated before rendering the component
  if (!auth.currentUser) {
    return <div>Please log in to view your friends list.</div>;
  }
  return (
    <div className="friends-list">
      <h2>My Friends</h2>
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for friends..."
        />
        <button onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id}>
            {friend.displayName || friend.email} - {friend.points} pts
            <button
              onClick={() => {
                /* function to send friend request */
              }}
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
          </li>
        ))}
      </ul>
      <div className="search-results">
        <h3>Search Results</h3>
        <ul>
          {searchResults.map((result) => (
            <li key={result.uid}>
              {result.displayName || result.email}
              <button onClick={() => sendFriendRequest(result.uid)}>
                <FontAwesomeIcon icon={faUserPlus} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="incoming-requests">
        <h3>Incoming Friend Requests</h3>
        <ul>
          {incomingRequests.map((request) => (
            <li key={request.id}>
              {request.from} sent you a friend request.
              <button
                onClick={() => acceptFriendRequest(request.id, request.from)}
              >
                Accept
              </button>
              <button onClick={() => rejectFriendRequest(request.id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendsList;

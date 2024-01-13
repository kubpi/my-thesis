import React, { useEffect, useState } from "react";
import "../css/Podium.css";
import {
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const FriendsRanking = ({ activeTabId }) => {
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const fetchTabs = async () => {
      const firestore = getFirestore();
      const usersRef = collection(firestore, "userBettingTabs");
      const q = query(usersRef, where("tabs.id", "==", activeTabId));
      const querySnapshot = await getDocs(q);
      const fetchedTabs = [];
      querySnapshot.forEach((doc) => {
        // Assuming that the structure of each user's document contains an array of tabs
        // and that each tab is an object with an 'id' field
        const userTabs = doc.data().tabs || [];
        const matchingTab = userTabs.find((tab) => tab.id === activeTabId);
        if (matchingTab) {
          fetchedTabs.push(matchingTab);
        }
      });
      setTabs(fetchedTabs);
    };

    if (activeTabId) {
      fetchTabs();
    }
  }, [activeTabId]);

  return (
    <div className="main-container" id="podium">
      {/* Render your podium or tabs here using the state 'tabs' */}
    </div>
  );
};

export default FriendsRanking;

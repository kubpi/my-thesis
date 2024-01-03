import {useEffect} from 'react';import './Podium.css';
import { useState, useContext, useCallback  } from "react";
import "./Podium.css";

import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Podium = () => {
  const rankings = [
    { name: 'Alice', points: 150 },
    { name: 'Bob', points: 120 },
    { name: 'Charlie', points: 110 },
    // Additional rankings
    { name: 'Dave', points: 100 },
    { name: 'Eve', points: 90 },
    { name: 'Frank', points: 85 },
    // ... more rankings if needed
  ];
  const [tabs, setTabs] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [userScores, setUserScores] = useState([]);
  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const docRef = doc(firestore, "userBettingTabs", user.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const fetchedTabs = docSnap.data().tabs;
            setTabs(fetchedTabs);
            calculateAndUpdateTotal(fetchedTabs);
            
          }
        })
        .catch((error) => {
          console.error("Error loading betting tabs:", error);
        });
    }
  }, [user]);

  
  // Assume `calculateTotal` is called to update `totalPoints` and `totalBets` for the current user
  const calculateAndUpdateTotal = (tabs) => {
    let totalPoints = 0;
    let totalBets = 0;
  
    tabs.forEach(tab => {
      tab.matches?.forEach(match => {
        if (match.betPlaced && match.points !== null && match.betAwayScore !== null && match.betHomeScore !== null) {
          totalPoints += match.points || 0;
          totalBets++;
        }
      });
    });
  
    setTotalPoints(totalPoints);
    setTotalBets(totalBets);
  
    // Use displayName or fallback to email if displayName is not set
    const userDisplayName = auth.currentUser.displayName || auth.currentUser.email;
  
    // Reference to the user's score document
    const userScoreRef = doc(firestore, "userScores", auth.currentUser.uid);
  
    // Check if a score document for the user already exists
    getDoc(userScoreRef).then((docSnap) => {
      if (docSnap.exists()) {
        // If it exists, update the current score
        updateDoc(userScoreRef, {
          totalPoints: totalPoints,
          totalBets: totalBets
        });
      } else {
        // If not, create a new score document
        setDoc(userScoreRef, {
          userId: auth.currentUser.uid,
          totalPoints: totalPoints,
          totalBets: totalBets,
          displayName: userDisplayName // Use the displayName or email
        });
      }
    });
  };
  
 // Fetch all user scores to display in the leaderboard
 useEffect(() => {
  const scoresRef = collection(firestore, "userScores");

  // Fetch and listen for updates to scores in real-time
  onSnapshot(scoresRef, (querySnapshot) => {
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push(doc.data());
    });
    // Sort by total points descending
    scores.sort((a, b) => b.totalPoints - a.totalPoints);
    setUserScores(scores);
  });
}, []);

  console.log(tabs)
  console.log(totalPoints)
  return (
    <>
<div className="podium">
  {userScores.map((user, index) => (
    <div key={user.userId} className={`place ${index === 0 ? 'first-place' : index === 1 ? 'second-place' : 'third-place'}`}>
      <div className="rank">{index + 1}</div>
      <div className="competitor">{user.displayName || user.email}</div>
      <div className="points">{user.totalPoints} pts</div>
    </div>
  ))}
</div>
      <div className="additional-rankings">
        {rankings.slice(3).map((ranking, index) => (
          <div key={index} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{ranking.name}</span>
            <span className="additional-points">{ranking.points} pts</span>
          </div>
        ))}
      </div>
      <div className="betting-summary">
        <p>Total Points from Bets: {totalPoints}</p>
        <p>Total Number of Bet Matches: {totalBets}</p>
      </div>
    </>
  );
};

export default Podium;

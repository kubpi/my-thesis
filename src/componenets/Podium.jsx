import {useEffect} from 'react';import './Podium.css';
import { useState, useContext, useCallback  } from "react";
import "./Podium.css";

import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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
            calculateTotal(fetchedTabs);
          }
        })
        .catch((error) => {
          console.error("Error loading betting tabs:", error);
        });
    }
  }, [user]);

  const calculateTotal = (tabs) => {
    let totalPoints = 0;
    let totalBets = 0;
  
    tabs.forEach(tab => {
      // Safely iterate over matches if it exists
      tab.matches?.forEach(match => {
        if (match.betPlaced && match.isItFinished === true) {
          console.log(match)
          totalPoints += match.points || 0; // Add points if available
          totalBets++; // Count every bet match
        }
      });
    });
  
    setTotalPoints(totalPoints);
    setTotalBets(totalBets);
  };
  



  console.log(tabs)
  console.log(totalPoints)
  return (
    <>
      <div className="podium">
        <div className="place second-place">
          <div className="rank">2</div>
          <div className="competitor">{rankings[1].name}</div>
          <div className="points">{rankings[1].points} pts</div>
        </div>
        <div className="place first-place">
          <div className="rank">1</div>
          <div className="competitor">{rankings[0].name}</div>
          <div className="points">{rankings[0].points} pts</div>
        </div>
        <div className="place third-place">
          <div className="rank">3</div>
          <div className="competitor">{rankings[2].name}</div>
          <div className="points">{rankings[2].points} pts</div>
        </div>
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

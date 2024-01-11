import { useEffect } from "react";

import { useState, useContext, useCallback } from "react";
import "../css/Podium.css";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Navbar } from "./Nabar";

const Podium = () => {
  const ITEMS_PER_PAGE = 5; // Define how many items you want per page
  const rankings = [
    { name: "Alice", points: 150 },
    { name: "Bob", points: 120 },
    { name: "Charlie", points: 110 },
    // Additional rankings
    { name: "Dave", points: 100 },
    { name: "Eve", points: 90 },
    { name: "Frank", points: 85 },
    // ... more rankings if needed
  ];
  const [tabs, setTabs] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [userScores, setUserScores] = useState([]);
  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  const [currentPage, setCurrentPage] = useState(1); // State to keep track of the current page
  const [totalPages, setTotalPages] = useState(0); // State to keep track of total pages

  useEffect(() => {
    // Calculate total pages
    setTotalPages(Math.ceil(userScores.length / ITEMS_PER_PAGE));
  }, [userScores]); // Recalculate total pages when userScores changes

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ... (rest of your useEffect hooks)

  // Calculate the slice of userScores to display
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUserScores = userScores.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // useEffect(() => {
  //   if (user) {
  //     const docRef = doc(firestore, "userBettingTabs", user.uid);
  //     getDoc(docRef)
  //       .then((docSnap) => {
  //         if (docSnap.exists()) {
  //           const fetchedTabs = docSnap.data().tabs;
  //           setTabs(fetchedTabs);
  //           calculateAndUpdateTotal(fetchedTabs);

  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error loading betting tabs:", error);
  //       });
  //   }
  // }, [user]);

  // const calculateAndUpdateTotal = (tabs) => {
  //   let totalPoints = 0;
  //   let totalBets = 0;

  //   tabs.forEach(tab => {
  //     tab.matches?.forEach(match => {
  //       if (match.betPlaced && match.points !== null && match.betAwayScore !== null && match.betHomeScore !== null) {
  //         totalPoints += match.points || 0;
  //         totalBets++;
  //       }
  //     });
  //   });

  //   setTotalPoints(totalPoints);
  //   setTotalBets(totalBets);

  //   // Use displayName or extract the part before '@' in email if displayName is not set
  //   const email = auth.currentUser.email;
  //   const userDisplayName = auth.currentUser.displayName || email.substring(0, email.lastIndexOf('@'));

  //   // Reference to the user's score document
  //   const userScoreRef = doc(firestore, "userScores", auth.currentUser.uid);

  //   // Check if a score document for the user already exists
  //   getDoc(userScoreRef).then((docSnap) => {
  //     if (docSnap.exists()) {
  //       // If it exists, update the current score
  //       updateDoc(userScoreRef, {
  //         totalPoints: totalPoints,
  //         totalBets: totalBets
  //       });
  //     } else {
  //       // If not, create a new score document
  //       setDoc(userScoreRef, {
  //         userId: auth.currentUser.uid,
  //         totalPoints: totalPoints,
  //         totalBets: totalBets,
  //         displayName: userDisplayName // Use the displayName or extracted name from email
  //       });
  //     }
  //   });
  // };

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

  console.log(tabs);
  console.log(totalPoints);
  return (
    <>
      <Navbar></Navbar>
      <div className="podium-container">
        <h2 className="podium-title">Ranking wszystkich użytkowników</h2>
        <div className="podium">
          {userScores.slice(0, 3).map((user, index) => (
            <div
              key={user.userId}
              className={`place ${
                index === 0
                  ? "first-place"
                  : index === 1
                  ? "second-place"
                  : "third-place"
              }`}
            >
              <span className="rank-icon">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </span>
              <span className="rank-name">
                {user.displayName || user.email}
              </span>
              <div className="points"> {user.totalBets} meczy</div>
              <div className="points">{user.totalPoints} pkt</div>
            </div>
          ))}
        </div>
        <div className="additional-rankings">
          {userScores.slice(3).map((user, index) => (
            <div key={user.userId} className="additional-place">
              <span className="additional-rank">{index + 4}</span>
              <span className="additional-name">
                {user.displayName || user.email}
              </span>
              <span className="additional-points"></span>
              <div className="points"> {user.totalBets} meczy</div>
              <span className="additional-points"> {user.totalPoints} pkt</span>
            </div>
          ))}
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(currentPage - 1)}>
              {"<"}
            </button>
            {/* Dynamically generate page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={currentPage === number ? "active" : ""}
                >
                  {number}
                </button>
              )
            )}
            <button onClick={() => handlePageChange(currentPage + 1)}>
              {">"}
            </button>
          </div>
        </div>
      </div>

      {/* <div className="betting-summary">
        <p>Total Points from Bets: {totalPoints}</p>
        <p>Total Number of Bet Matches: {totalBets}</p>
      </div> */}
    </>
  );
};

export default Podium;

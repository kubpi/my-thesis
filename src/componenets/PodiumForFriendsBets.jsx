import React, { useEffect, useState } from 'react';
import '../css/Podium.css';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PodiumForFriendsBets = ({kuba}) => {
  const ITEMS_PER_PAGE = 5;
  const [userScores, setUserScores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication

  console.log(kuba)
  let sortedData;
  let pointsForRanking = []
  const calucatePointsForRanking = function () {
    const userPoints = {};
  
    kuba.forEach((tab) => {
      const userUid = tab.userUid;
      const points = tab.points;
  
      if (!userPoints[userUid]) {
        userPoints[userUid] = { userUid, displayName: user.displayName, points: 0 };
      }
      
      userPoints[userUid].points += points;
  
      tab?.mecze?.forEach((match) => {
        const matchUserUid = match.userUid;
        const matchPoints = match.points;
  
        if (!userPoints[matchUserUid]) {
          userPoints[matchUserUid] = { userUid: matchUserUid, displayName: match.displayName, points: 0 };
        }
  
        userPoints[matchUserUid].points += matchPoints;
      });
    });
  
    // Wyniki zapisane jako tablica obiektów
    sortedData = Object.values(userPoints);
    // Sortuj dane po liczbie punktów od największej do najmniejszej
    sortedData.sort((a, b) => b.points - a.points);
  };
  
  calucatePointsForRanking();
  console.log(sortedData);

  console.log(pointsForRanking)
  // Calculate total pages
  const totalPages = Math.ceil(userScores.length / ITEMS_PER_PAGE);

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
    };
    

  // Calculate the slice of userScores to display
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUserScores = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="main-container" id="podium">
      <h2 className="podium-title">Wynik zakładu: </h2>
      <div className="podium">
        {sortedData.slice(0, 3).map((user, index) => (
          <div
            key={user.userUid}
            className={`podium-place ${
              index === 0 ? 'first-place' : index === 1 ? 'second-place' : 'third-place'
            }`}
          >
            <div className={`podium-number ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}`}>
              {index + 1}
            </div>
            <span className="rank-name">
              {user.displayName}
            </span>
            <div className="points">{user.points} pkt</div>
            {/* <div className="matches">{user.totalBets} meczy</div> */}
          </div>
        ))}
      </div>
      <ul className="additional-rankings">
        {paginatedUserScores.slice(3).map((user, index) => (
          <li key={user.userUid} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{user.displayName}</span>
            <span className="points">{user.points} pkt</span>
            {/* <span className="matches">{user.totalBets} meczy</span> */}
          </li>
        ))}
      </ul>
      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>
      </div>
    </div>
  );
};

export default PodiumForFriendsBets;

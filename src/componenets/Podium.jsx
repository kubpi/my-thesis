import  { useEffect, useState } from 'react';
import '../css/Podium.css';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Podium = () => {
  const ITEMS_PER_PAGE = 5;
  const [userScores, setUserScores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication

  useEffect(() => {
    const scoresRef = collection(firestore, 'userScores');
    const unsubscribe = onSnapshot(scoresRef, (querySnapshot) => {
      const scores = querySnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));
      scores.sort((a, b) => b.totalPoints - a.totalPoints);
      setUserScores(scores);
    });
    return unsubscribe; // Detach listener on unmount
  }, [firestore]);

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
  const paginatedUserScores = userScores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  console.log(userScores)
  return (
    <div className="main-container betting-text-style" id="podium">
      <h2 className="podium-title">Ranking wszystkich użytkowników</h2>
      <div className="podium">
        {userScores.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
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
            <div className="points">{user.totalPoints} pkt</div>
            <div className="matches">{user.totalBets} meczy</div>
          </div>
        ))}
      </div>
      <ul className="additional-rankings">
        {paginatedUserScores.slice(3).map((user, index) => (
          <li key={user.userId} className="additional-place">
            <span className="additional-rank">{index + 4}</span>
            <span className="additional-name">{user.displayName}</span>
            <span className="points">{user.totalPoints} pkt</span>
            <span className="matches">{user.totalBets} meczy</span>
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

export default Podium;

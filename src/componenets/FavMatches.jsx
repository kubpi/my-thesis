

import "./Account.css";
import { useEffect,useState } from "react";
export function FavMatches() {

    const [favoriteMatches, setFavoriteMatches] = useState([]);

  // Fetch favorite matches from local storage on component mount
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavoriteMatches(storedFavorites);
  }, []);
    
    console.log(favoriteMatches)
   const matches = [
    { id: 1, homeTeam: 'Bournemouth', img:'', awayTeam: 'Aston Villa', homeScore: 2, awayScore: 2, homeDetails: '(1)', awayDetails: '(1)' },
    { id: 2, homeTeam: 'CHELSEA', img:'', awayTeam: 'Brighton', homeScore: 3, awayScore: 2, homeDetails: '(2)', awayDetails: '(1)' },
    // ... add more matches as needed
  ];

  return (
    <div className="scoreboard">
  <div className="league-title">ANGLIA: Premier League</div>
  
  {favoriteMatches.map((match) => (
      <div key={match.id} className="match">
          <div className="add-border">
      <span className="teamName">{match.homeTeam.name} {match.homeScore.name}</span>
      
      <span className="teamName ">{match.awayTeam.current} {match.awayScore.current}</span>
    </div>
    </div>
  ))}
</div>

  );
           
}

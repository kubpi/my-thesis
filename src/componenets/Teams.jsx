import "./Matches.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000); 
  let hours = date.getHours().toString().padStart(2, "0"); // Używaj getHours zamiast getUTCHours
  let minutes = date.getMinutes().toString().padStart(2, "0"); // Używaj getMinutes zamiast getUTCMinutes
  return `${hours}:${minutes}`;
};


function ReturnTeamImage(teamId) {
  const baseUrl = "https://api.sofascore.app/api/v1/team";
  const url = `${baseUrl}/${teamId}/image`;
  return url;
}

export function Teams(props) {
  const { homeTeam, homeScore, awayTeam, awayScore ,startTimestamp, roundInfo } = props;
  //console.log(homeTeam.id)
  const homeTeamImg = ReturnTeamImage(homeTeam.id)
  const awayTeamImg = ReturnTeamImage(awayTeam.id)

  //console.log(homeTeamImg);
  const [homeColor, setHomeColor] = useState(''); // Kolor dla wyniku homeTeam
  const [awayColor, setAwayColor] = useState(''); // Kolor dla wyniku awayTeam

  const [key, setKey] = useState(Math.random()); // początkowy klucz

  useEffect(() => {
    // Aktualizuj klucz za każdym razem, gdy komponent się renderuje
    if (typeof homeScore.display === 'undefined' || typeof awayScore.display === 'undefined' || homeScore.display === null || awayScore.display === null) {
      // jeśli jedno z wyświetleń wyniku jest niezdefiniowane lub null
      setHomeColor(null);
      setAwayColor(null);
  } else if (homeScore.display > awayScore.display) {
      setHomeColor('green');
      setAwayColor('red');
  } else if (homeScore.display < awayScore.display) {
      setHomeColor('red');
      setAwayColor('green');
  } else if(homeScore.display == awayScore.display) {
      setHomeColor('gray'); // jeśli wynik jest równy
      setAwayColor('gray'); // jeśli wynik jest równy
  }
  
    setKey(Math.random());
  }, [homeTeam, awayTeam, awayScore.display, homeScore.display]); // możesz tu dodać zależności, które powodują ponowne renderowanie

  return (
    <div className="team-container">
      
      <div className="teams fadeanime" key={key}>       
        <div className="single-team">
          <img src={homeTeamImg} alt="Barcelona" className="team-logo" />
          <span className="team-name">{homeTeam?.name}</span>
          <span className="score" style={{"background-color": homeColor}}>{homeScore?.display}</span>
        </div>
        <div className="single-team">
          <img src={awayTeamImg} alt="Szachtar" className="team-logo" />
          <span className="team-name">{awayTeam?.name}</span>
          <span className="score" style={{"background-color": awayColor}}>{awayScore?.display}</span>
        </div>
      </div>

      {typeof homeScore.display === 'undefined' && <div className="match-time">
        <span className="clock-icon">⏰</span> {convertDate(startTimestamp)}
        
      </div>}
      
    </div>
  );
}
Teams.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,  
  startTimestamp: PropTypes.number.isRequired,
  awayScore: PropTypes.object.isRequired,
  homeScore: PropTypes.object.isRequired,
};

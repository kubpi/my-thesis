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
const calculateMatchTimeInMinutes = (startTimestamp, statusTime, time, matchStatus, changes) => {
  // const currentTime = Date.now() / 1000; // Aktualny czas w sekundach
  const currentTime = Date.now() / 1000; // Aktualny czas w sekundach

const timik = currentTime - time.currentPeriodStartTimestamp + time?.initial
  const elapsed_minutes = Math.floor(timik / 60)
  return elapsed_minutes+1; // Pierwsza połowa

  // Sprawdzanie czy mecz się zakończył
//   if (time.currentPeriodStartTimestamp === time.max) {
//     return 90; // Mecz zakończył się po pełnych 90 minutach
//   }
//   if (matchStatus?.description === "Halftime") {
//     return "Przerwa"; // Mecz zakończył się po pełnych 90 minutach
// }
//   const elapsedTime = currentTime - time.currentPeriodStartTimestamp // Czas, który upłynął od początku meczu

//   return Math.floor(elapsedTime / 60); // Pierwsza połowa
  
  // if (elapsedTime <= 45 * 60) {
  //     return Math.floor(elapsedTime / 60); // Pierwsza połowa
  // } else {
  //     // Dodajemy przerwę między połówkami (na przykład 15 minut)
  //     //const halftimeBreak = 15; 
  //     return 45  + Math.floor((elapsedTime - 45 * 60) / 60); // Druga połowa
  // }

};



export function Teams(props) {
  const { homeTeam, homeScore, awayTeam, awayScore ,startTimestamp, statusTime, time, changes,matchStatus, currentPeriodStartTimestamp } = props;
  //console.log(homeTeam.id)
  const homeTeamImg = ReturnTeamImage(homeTeam.id)
  const awayTeamImg = ReturnTeamImage(awayTeam.id)

  //console.log(homeTeamImg);
  const [homeColor, setHomeColor] = useState(''); // Kolor dla wyniku homeTeam
  const [awayColor, setAwayColor] = useState(''); // Kolor dla wyniku awayTeam

  const [key, setKey] = useState(Math.random()); // początkowy klucz

  useEffect(() => {
    // Aktualizuj klucz za każdym razem, gdy komponent się renderuje
    const redColor = '#CD4439'
    const greenColor = '#72B896'
    const grayColor = '#A9A9A9'
    if (typeof homeScore.display === 'undefined' || typeof awayScore.display === 'undefined' || homeScore.display === null || awayScore.display === null) {
      // jeśli jedno z wyświetleń wyniku jest niezdefiniowane lub null
      setHomeColor(null);
      setAwayColor(null);
  } else if (homeScore.display > awayScore.display) {
      setHomeColor(greenColor);
      setAwayColor(redColor);
  } else if (homeScore.display < awayScore.display) {
      setHomeColor(redColor);
      setAwayColor(greenColor);
  } else if(homeScore.display == awayScore.display) {
      setHomeColor(grayColor); // jeśli wynik jest równy
      setAwayColor(grayColor); // jeśli wynik jest równy
  }
  
    setKey(Math.random());
  }, [homeTeam, awayTeam, awayScore.display, homeScore.display]); // możesz tu dodać zależności, które powodują ponowne renderowanie

  return (
    <div className="team-container">
      
      <div className="teams fadeanime" key={key}>       
        <div className="single-team">
          <img src={homeTeamImg} alt="Barcelona" className="team-logo" />
          <span className="team-name">{homeTeam?.name}</span>
          {typeof homeScore.display !== 'undefined' && <div className="match-time">
          <span className="score" style={{backgroundColor: homeColor}}>{homeScore?.display}</span>
        
      </div>}
          
        </div>
        <div className="single-team">
          <img src={awayTeamImg} alt="Szachtar" className="team-logo" />
          <span className="team-name">{awayTeam?.name}</span>
          {typeof awayScore.display !== 'undefined' && <div className="match-time">
          <span className="score" style={{backgroundColor: awayColor}}>{awayScore?.display}</span>
        
      </div>}
        </div>
      </div>

      {typeof homeScore.display === 'undefined' && <div className="match-time">
        <span className="clock-icon">⏰</span> {convertDate(startTimestamp)}
        
      </div>}
      {typeof statusTime !== 'undefined' && <div className="match-time">
        <span className="clock-icon"></span> {calculateMatchTimeInMinutes(startTimestamp, statusTime, time,matchStatus,changes)}'
        
      </div>}
      {matchStatus === "Halftime" && <div className="match-time">
        <span className="clock-icon"></span> Przerwa
        
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

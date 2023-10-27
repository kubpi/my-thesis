import "./Matches.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000); // Mnożymy przez 1000, aby uzyskać milisekundy
  let hours = date.getUTCHours().toString().padStart(2, "0"); // Pobieramy godziny i dodajemy zero na początku, jeśli to konieczne
  let minutes = date.getUTCMinutes().toString().padStart(2, "0"); // Pobieramy minuty i dodajemy zero na początku, jeśli to konieczne
  return `${hours}:${minutes}`;
};

function ReturnTeamImage(teamId) {
  const baseUrl = "https://api.sofascore.app/api/v1/team";
  const url = `${baseUrl}/${teamId}/image`;
  return url;
}

export function Teams(props) {
  const { homeTeam, awayTeam, startTimestamp } = props;
  console.log(homeTeam.id)
  const homeTeamImg = ReturnTeamImage(homeTeam.id)
  const awayTeamImg = ReturnTeamImage(awayTeam.id)

  console.log(homeTeamImg);
  

  const [key, setKey] = useState(Math.random()); // początkowy klucz

  useEffect(() => {
    // Aktualizuj klucz za każdym razem, gdy komponent się renderuje
    setKey(Math.random());
  }, [homeTeam, awayTeam]); // możesz tu dodać zależności, które powodują ponowne renderowanie
  return (
    <div className="team-container">
      <div className="teams fadeanime" key={key}>
        <div className="single-team">
          <img src={homeTeamImg} alt="Barcelona" className="team-logo" />
          <span className="team-name">{homeTeam.name}</span>
        </div>
        <div className="single-team">
          <img src={awayTeamImg} alt="Szachtar" className="team-logo" />
          <span className="team-name">{awayTeam.name}</span>
        </div>
      </div>

      <div className="match-time">
        <span className="clock-icon">⏰</span> {convertDate(startTimestamp)}
      </div>
    </div>
  );
}
Teams.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,
  startTimestamp: PropTypes.string.isRequired,
};

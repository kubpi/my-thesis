import "./Matches.css";
import PropTypes from "prop-types";
const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000); // Mnożymy przez 1000, aby uzyskać milisekundy
  let hours = date.getUTCHours().toString().padStart(2, "0"); // Pobieramy godziny i dodajemy zero na początku, jeśli to konieczne
  let minutes = date.getUTCMinutes().toString().padStart(2, "0"); // Pobieramy minuty i dodajemy zero na początku, jeśli to konieczne
  return `${hours}:${minutes}`;
};
export function Teams(props) {
  const { homeTeam, awayTeam, startTimestamp } = props;
  return (
    <div className="team-container">
      <div className="teams">
        <div className="single-team">
          {/* <img src={homeTeam.crest} alt="Barcelona" className="team-logo" /> */}
          <span className="team-name">{homeTeam.name}</span>
        </div>
        <div className="single-team">
          {/* <img src={awayTeam.crest} alt="Szachtar" className="team-logo" />{" "} */}
          {/* Zastąp "URL_LOGO_SZACHTAR" rzeczywistym adresem URL loga Szachtar */}
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

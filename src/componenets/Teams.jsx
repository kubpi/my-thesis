import "./Matches.css";
import PropTypes from "prop-types";
const convertDate = (utcDate) => {
  let newDate = new Date(utcDate)
  const formattedDate = newDate.toLocaleString('pl-PL', {
   
    hour: '2-digit',
    minute: '2-digit'
  });
  return formattedDate.toString();
} 
export function Teams(props) {
  const { homeTeam, awayTeam, utcDate } = props
  return (
    <div className="team-container">
      <div className="teams">
        <div className="single-team">
          <img src={homeTeam.crest} alt="Barcelona" className="team-logo" />
          <span className="team-name">{homeTeam.name}</span>
        </div>
        <div className="single-team">
          <img src={awayTeam.crest} alt="Szachtar" className="team-logo" /> {/* Zastąp "URL_LOGO_SZACHTAR" rzeczywistym adresem URL loga Szachtar */}
          <span className="team-name">{awayTeam.name}</span>
        </div>
      </div>

      <div className="match-time">
        <span className="clock-icon">⏰</span> {convertDate(utcDate)}
      </div>
    </div>
  );
}
Teams.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,
  utcDate: PropTypes.string.isRequired
};
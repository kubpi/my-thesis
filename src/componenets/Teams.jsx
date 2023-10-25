import "./Matches.css";

export function Teams() {
  return (
    <div className="team-container">
      <div className="teams">
        <div className="single-team">
          <img src="https://crests.football-data.org/675.png" alt="Barcelona" className="team-logo" />
          <span className="team-name">Barcelona</span>
        </div>
        <div className="single-team">
          <img src="https://crests.football-data.org/110.svg" alt="Szachtar" className="team-logo" /> {/* Zastąp "URL_LOGO_SZACHTAR" rzeczywistym adresem URL loga Szachtar */}
          <span className="team-name">Szachtar</span>
        </div>
      </div>

      <div className="match-time">
        <span className="clock-icon">⏰</span> 18:45
      </div>
    </div>
  );
}

import "../../css/Matches.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000);
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const calculateMatchTimeInMinutes = (time) => {
  const currentTime = Date.now() / 1000;
  const timik = currentTime - time.currentPeriodStartTimestamp + time?.initial;
  const elapsed_minutes = Math.floor(timik / 60);
  return elapsed_minutes + 1;
};

export function Teams(props) {
  const {
    homeTeam,
    homeScore,
    awayTeam,
    awayScore,
    startTimestamp,
    time,
    matchStatus,
    matchStatusType,
  } = props;

  const [homeColor, setHomeColor] = useState("");
  const [awayColor, setAwayColor] = useState("");

  const [key, setKey] = useState(Math.random());
  const [isLive, setIsLive] = useState(false);

  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");

  useEffect(() => {
    const fetchTeamLogo = async () => {
      const storedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
      const storage = getStorage();

      if (storedLogos[props.homeTeam.id]) {
        setHomeTeamLogo(storedLogos[props.homeTeam.id]);
      } else {
        const logoRef = ref(storage, `teamsLogos/${props.homeTeam.id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          setHomeTeamLogo(url);
          storedLogos[props.homeTeam.id] = url;
          localStorage.setItem("teamsLogos", JSON.stringify(storedLogos));
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
        }
      }
    };

    fetchTeamLogo();
  }, [homeTeam]);

  useEffect(() => {
    const fetchTeamLogo = async () => {
      const storedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
      const storage = getStorage();

      if (storedLogos[props.awayTeam.id]) {
        setAwayTeamLogo(storedLogos[props.awayTeam.id]);
      } else {
        const logoRef = ref(storage, `teamsLogos/${props.awayTeam.id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          setAwayTeamLogo(url);
          storedLogos[props.awayTeam.id] = url;
          localStorage.setItem("teamsLogos", JSON.stringify(storedLogos));
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
        }
      }
    };

    fetchTeamLogo();
  }, [awayTeam]);

  useEffect(() => {
    const redColor = "#CD4439";
    const greenColor = "#72B896";
    const grayColor = "#A9A9A9";
    if (
      typeof homeScore.display === "undefined" ||
      typeof awayScore.display === "undefined" ||
      homeScore.display === null ||
      awayScore.display === null
    ) {
      setHomeColor(null);
      setAwayColor(null);
    } else if (homeScore.display > awayScore.display) {
      setHomeColor(greenColor);
      setAwayColor(redColor);
    } else if (homeScore.display < awayScore.display) {
      setHomeColor(redColor);
      setAwayColor(greenColor);
    } else if (homeScore.display == awayScore.display) {
      setHomeColor(grayColor);
      setAwayColor(grayColor);
    }

    setKey(Math.random());
  }, [homeTeam, awayTeam, awayScore.display, homeScore.display]);
  useEffect(() => {
    if (matchStatus && matchStatusType === "inprogress") {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, [matchStatus]);
  return (
    <>
      <div className={`team-container ${isLive ? "match-live" : ""}`}>
        <div className="teams fadeanime" key={key}>
          <div className="single-team">
            <img
              src={homeTeamLogo}
              alt={homeTeam?.name}
              className="team-logo"
            />
            <span className="team-name">{homeTeam?.name}</span>
            {typeof homeScore.display !== "undefined" && (
              <div className="match-time">
                <span className="score" style={{ backgroundColor: homeColor }}>
                  {homeScore?.display}
                </span>
              </div>
            )}
          </div>
          <div className="single-team">
            <img
              src={awayTeamLogo}
              alt={awayTeam?.name}
              className="team-logo"
            />
            <span className="team-name">{awayTeam?.name}</span>
            {typeof awayScore.display !== "undefined" && (
              <div className="match-time">
                <span className="score" style={{ backgroundColor: awayColor }}>
                  {awayScore?.display}
                </span>
              </div>
            )}
          </div>
        </div>

        {typeof homeScore.display === "undefined" && (
          <div className="match-time">
            <span className="clock-icon">⏰</span> {convertDate(startTimestamp)}
          </div>
        )}
        {Object.keys(time).length !== 0 &&
          matchStatus !== "Halftime" &&
          matchStatus !== "Ended" && (
            <div className="match-time">
              <span className="clock-icon"></span>{" "}
              {calculateMatchTimeInMinutes(time)}'
            </div>
          )}
        {matchStatus === "Halftime" && (
          <div className="match-time">
            <span className="clock-icon"></span> Przerwa
          </div>
        )}
      </div>
    </>
  );
}
Teams.propTypes = {
  homeTeam: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  awayTeam: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  homeScore: PropTypes.shape({
    display: PropTypes.number,
  }).isRequired,
  awayScore: PropTypes.shape({
    display: PropTypes.number,
  }).isRequired,
  startTimestamp: PropTypes.number.isRequired,
  statusTime: PropTypes.string,
  time: PropTypes.shape({
    currentPeriodStartTimestamp: PropTypes.number,
    initial: PropTypes.number,
  }),
  changes: PropTypes.object,
  matchStatus: PropTypes.string,
  matchStatusType: PropTypes.string,
  currentPeriodStartTimestamp: PropTypes.number,
};

Teams.defaultProps = {
  statusTime: "",
  time: {},
  changes: {},
  matchStatus: "",
  matchStatusType: "",
  currentPeriodStartTimestamp: 0,
};

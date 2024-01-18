//import "../../css/Matches.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import React from 'react';

const convertDate = (timestamp) => {
  let date = new Date(timestamp * 1000);
  let hours = date.getHours().toString().padStart(2, "0"); // Używaj getHours zamiast getUTCHours
  let minutes = date.getMinutes().toString().padStart(2, "0"); // Używaj getMinutes zamiast getUTCMinutes
  return `${hours}:${minutes}`;
};

const calculateMatchTimeInMinutes = (time) => {
  // const currentTime = Date.now() / 1000; // Aktualny czas w sekundach
  const currentTime = Date.now() / 1000; // Aktualny czas w sekundach

  const timik = currentTime - time.currentPeriodStartTimestamp + time?.initial;
  const elapsed_minutes = Math.floor(timik / 60);
  return elapsed_minutes + 1; // Pierwsza połowa
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
  //console.log(homeTeam.id)

  //console.log(homeTeamImg);
  const [homeColor, setHomeColor] = useState(""); // Kolor dla wyniku homeTeam
  const [awayColor, setAwayColor] = useState(""); // Kolor dla wyniku awayTeam

  const [key, setKey] = useState(Math.random()); // początkowy klucz
  const [isLive, setIsLive] = useState(false);

  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");

  useEffect(() => {
    const fetchTeamLogo = async () => {
      // Check if the logo URL is already in local storage
      const storedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
      const storage = getStorage();

      if (storedLogos[props.homeTeam.id]) {
        // Use the URL from local storage if it exists
        setHomeTeamLogo(storedLogos[props.homeTeam.id]);
      } else {
        // If not, fetch it from Firebase and store it in local storage
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
      // Check if the logo URL is already in local storage
      const storedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
      const storage = getStorage();

      if (storedLogos[props.awayTeam.id]) {
        // Use the URL from local storage if it exists
        setAwayTeamLogo(storedLogos[props.awayTeam.id]);
      } else {
        // If not, fetch it from Firebase and store it in local storage
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
    // Aktualizuj klucz za każdym razem, gdy komponent się renderuje
    const redColor = "#CD4439";
    const greenColor = "#72B896";
    const grayColor = "#A9A9A9";
    if (
      typeof homeScore.display === "undefined" ||
      typeof awayScore.display === "undefined" ||
      homeScore.display === null ||
      awayScore.display === null
    ) {
      // jeśli jedno z wyświetleń wyniku jest niezdefiniowane lub null
      setHomeColor(null);
      setAwayColor(null);
    } else if (homeScore.display > awayScore.display) {
      setHomeColor(greenColor);
      setAwayColor(redColor);
    } else if (homeScore.display < awayScore.display) {
      setHomeColor(redColor);
      setAwayColor(greenColor);
    } else if (homeScore.display == awayScore.display) {
      setHomeColor(grayColor); // jeśli wynik jest równy
      setAwayColor(grayColor); // jeśli wynik jest równy
    }

    setKey(Math.random());
  }, [homeTeam, awayTeam, awayScore.display, homeScore.display]); // możesz tu dodać zależności, które powodują ponowne renderowanie
  useEffect(() => {
    // Sprawdź, czy mecz jest na żywo
    if (matchStatus && matchStatusType === "inprogress") {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, [matchStatus]); // Zależność od matchStatus, który może się zmieniać
  return (
    <>
      <div className={`team-container ${isLive ? "match-live" : ""}`}>
        <div className="teams fadeanime" key={key}>
          <div className="single-team">
            <img src={homeTeamLogo} alt={homeTeam?.name} className="team-logo" />
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
            <img src={awayTeamLogo} alt={awayTeam?.name} className="team-logo" />
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
    id: PropTypes.string.isRequired
  }).isRequired,
  awayTeam: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }).isRequired,
  homeScore: PropTypes.shape({
    display: PropTypes.number
  }).isRequired,
  awayScore: PropTypes.shape({
    display: PropTypes.number
  }).isRequired,
  startTimestamp: PropTypes.number.isRequired,
  statusTime: PropTypes.string, // Tylko jeśli statusTime jest wymagany
  time: PropTypes.shape({
    currentPeriodStartTimestamp: PropTypes.number,
    initial: PropTypes.number
  }), // Zaktualizuj zgodnie z właściwościami obiektu 'time'
  changes: PropTypes.object, // Zaktualizuj zgodnie z właściwościami obiektu 'changes', jeśli jest używany
  matchStatus: PropTypes.string, // Tylko jeśli matchStatus jest wymagany
  matchStatusType: PropTypes.string, // Tylko jeśli matchStatusType jest wymagany
  currentPeriodStartTimestamp: PropTypes.number // Tylko jeśli currentPeriodStartTimestamp jest używany
};

// Ustawienie domyślnych wartości dla propsów (opcjonalne)
Teams.defaultProps = {
  statusTime: '',
  time: {},
  changes: {},
  matchStatus: '',
  matchStatusType: '',
  currentPeriodStartTimestamp: 0
};

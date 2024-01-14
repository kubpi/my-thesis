import "../../css/Matches.css";
import { Teams } from "./Teams";
import React, { useEffect, useState } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

export function CardBoxForMatches(props) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [logos, setLogos] = useState({});

  const matches = props.matches;
  let tournamentId = props.tournamentId;

  const [tournamentLogo, setTournamentLogo] = useState('');
console.log(tournamentId)
useEffect(() => {
  const fetchTournamentLogo = async () => {
    // Check if the logo URL is already in local storage
    const storedLogos = JSON.parse(localStorage.getItem('tournamentLogos')) || {};
    const storage = getStorage();

    if (storedLogos[props.tournamentId]) {
      // Use the URL from local storage if it exists
      setTournamentLogo(storedLogos[props.tournamentId]);
    } else {
      // If not, fetch it from Firebase and store it in local storage
      const logoRef = ref(storage, `tournamentsLogos/${props.tournamentId}.png`);
      try {
        const url = await getDownloadURL(logoRef);
        setTournamentLogo(url);
        storedLogos[props.tournamentId] = url;
        localStorage.setItem('tournamentLogos', JSON.stringify(storedLogos));
      } catch (error) {
        console.error("Error fetching tournament logo: ", error);
        // Optionally, set a default logo in case of an error
        setTournamentLogo('path_to_default_logo.png');
      }
    }
  };

  fetchTournamentLogo();
}, [props.tournamentId]);



  // Sortowanie meczów, mecze w trakcie będą pierwsze
  const sortedMatches = matches.slice().sort((a, b) => {
    if (a.status.type === "inprogress" && b.status.type !== "inprogress") {
      return -1; // a przed b
    } else if (
      a.status.type !== "inprogress" &&
      b.status.type === "inprogress"
    ) {
      return 1; // b przed a
    }
    return 0; // bez zmiany kolejności
  });
  // Deklaracja zmiennej do śledzenia poprzedniej kolejki
  let prevRound = null;

  return (
    <>
      <div
        className="card"
        style={{ width: "25rem", background: "#689577", position: "relative" }}
      >
        <div className="football-logo">
          {/* Use tournamentLogo for the src attribute */}
          <img src={tournamentLogo} alt="Tournament Logo" />
        </div>

        <div className="card-body">
          {sortedMatches.map((match) => {
            // Jeśli bieżąca kolejka jest inna niż poprzednia, ustaw poprzednią kolej na bieżącą i wyświetl nazwę kolejki
            const isNewRound = prevRound !== match?.roundInfo?.round;
            prevRound = match?.roundInfo?.round;

            return (
              <React.Fragment key={match.id}>
                {isNewRound && match?.roundInfo?.round && (
                  <div className="round">
                    <p>Kolejka {match?.roundInfo?.round}</p>
                  </div>
                )}
                <button
                  className="favorite-button"
                  onClick={() => {
                    const isFav = props.isFavorite(match.id);
                    isFav
                      ? props.removeFromFavorites(match.id)
                      : props.addToFavorites(match);
                  }}
                  aria-label={
                    props.isFavorite(match.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  {user ? (
                    props.isFavorite(match.id) ? (
                      "❤️"
                    ) : (
                      "🤍"
                    )
                  ) : (
                    <div></div>
                  )}

                  {/* Filled heart if favorite, empty heart if not */}
                </button>
                <Teams
                  homeTeam={match?.homeTeam}
                  homeScore={match?.homeScore}
                  awayTeam={match?.awayTeam}
                  awayScore={match?.awayScore}
                  startTimestamp={match?.startTimestamp}
                  statusTime={match?.statusTime}
                  time={match?.time}
                  changes={match?.changes?.changeTimestamp}
                  matchStatus={match?.status?.description}
                  matchStatusType={match?.status?.type}
                  currentPeriodStartTimestamp={
                    match?.time?.currentPeriodStartTimestamp
                  }
                 
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

// CardBoxForMatches.propTypes = {
//   matches: PropTypes.arrayOf(PropTypes.object).isRequired,

// };

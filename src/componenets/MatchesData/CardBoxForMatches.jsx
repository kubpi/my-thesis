import PropTypes from "prop-types";
import "../../css/Matches.css";
import { Teams } from "./Teams";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export function CardBoxForMatches(props) {
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const matches = props.matches;
  let tournamentId = props.tournamentId;

  const [tournamentLogo, setTournamentLogo] = useState("");
  console.log(tournamentId);
  useEffect(() => {
    const fetchTournamentLogo = async () => {
      const storedLogos =
        JSON.parse(localStorage.getItem("tournamentLogos")) || {};
      const storage = getStorage();

      if (storedLogos[props.tournamentId]) {
        setTournamentLogo(storedLogos[props.tournamentId]);
      } else {
        const logoRef = ref(
          storage,
          `tournamentsLogos/${props.tournamentId}.png`
        );
        try {
          const url = await getDownloadURL(logoRef);
          setTournamentLogo(url);
          storedLogos[props.tournamentId] = url;
          localStorage.setItem("tournamentLogos", JSON.stringify(storedLogos));
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);

          setTournamentLogo("path_to_default_logo.png");
        }
      }
    };

    fetchTournamentLogo();
  }, [props.tournamentId]);

  const sortedMatches = matches.slice().sort((a, b) => {
    if (a.status.type === "inprogress" && b.status.type !== "inprogress") {
      return -1;
    } else if (
      a.status.type !== "inprogress" &&
      b.status.type === "inprogress"
    ) {
      return 1;
    }
    return 0;
  });

  let prevRound = null;

  return (
    <>
      <div
        className="card"
        style={{ width: "25rem", background: "#689577", position: "relative" }}
      >
        <div className="football-logo">
          <img src={tournamentLogo} alt="Tournament Logo" />
        </div>

        <div className="card-body">
          {sortedMatches.map((match) => {
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
CardBoxForMatches.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      homeTeam: PropTypes.object,
      awayTeam: PropTypes.object,
      homeScore: PropTypes.object,
      awayScore: PropTypes.object,
      startTimestamp: PropTypes.number,
      statusTime: PropTypes.string,
      time: PropTypes.object,
      changes: PropTypes.object,
      status: PropTypes.shape({
        description: PropTypes.string,
        type: PropTypes.string.isRequired,
      }).isRequired,
      roundInfo: PropTypes.shape({
        round: PropTypes.number,
      }),
    })
  ).isRequired,
  tournamentId: PropTypes.string,
  isFavorite: PropTypes.func,
  addToFavorites: PropTypes.func,
  removeFromFavorites: PropTypes.func,
};

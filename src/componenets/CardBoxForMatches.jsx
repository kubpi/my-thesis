import "./Matches.css";
import { Teams } from "./Teams";
import PropTypes from "prop-types";
import React from "react";
export function CardBoxForMatches(props) {
  const matches = props.matches;
  let img = props.img;
  

    // Sortowanie meczów, mecze w trakcie będą pierwsze
    const sortedMatches = matches.slice().sort((a, b) => {
      if (a.status.type === "inprogress" && b.status.type !== "inprogress") {
        return -1; // a przed b
      } else if (a.status.type !== "inprogress" && b.status.type === "inprogress") {
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
          <img src={img} alt="Logo piłkarskie" />
        </div>

        <div className="card-body">
          {
            sortedMatches.map((match) => {
              // Jeśli bieżąca kolejka jest inna niż poprzednia, ustaw poprzednią kolej na bieżącą i wyświetl nazwę kolejki
              const isNewRound = prevRound !== match?.roundInfo?.round;
              prevRound = match?.roundInfo?.round;
      
              return (
                <React.Fragment key={match.id}>
                  {isNewRound && (
                    match?.roundInfo?.round && (<div className="round">
                       <p>Kolejka {match?.roundInfo?.round}</p>
                    </div>)
                    
                  )}
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
                    currentPeriodStartTimestamp={match?.time?.currentPeriodStartTimestamp}
                  />
                </React.Fragment>
              );
            })
          }
        </div>
      </div>
    </>
  );
}

CardBoxForMatches.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  img: PropTypes.string.isRequired,
};

import "./Matches.css";
import { Teams } from "./Teams";
import PropTypes from "prop-types";

export function CardBoxForMatches(props) {
  const matches = props.matches;
  let img = props.img;

  
 
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
            matches.map((match, index) => (
               <Teams
                key={index}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                startTimestamp={match.startTimestamp}
               
              />
            ))}
        </div>
      </div>
    </>
  );
}
CardBoxForMatches.propTypes = {
  matches: PropTypes.object.isRequired,
  img: PropTypes.string.isRequired,
};

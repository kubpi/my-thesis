import "./Matches.css";
import { Teams } from "./Teams";
import PropTypes from "prop-types";
export function CardBoxForMatches(props) {
  const clMatches = props.clMatches;
  if (clMatches && clMatches.length > 0) {
    console.log(clMatches[0]);
  }
  
  return (
    <>
      <div
        className="card"
        style={{ width: "25rem", background: "#689577", position: "relative" }}
      >
        <div className="football-logo">
          <img
            src="https://crests.football-data.org/CL.png"
            alt="Logo piłkarskie"
          />
        </div>

        <div className="card-body">
          <Teams></Teams>
          <Teams></Teams>
          <Teams></Teams>
        </div>
      </div>
    </>
  );
}
CardBoxForMatches.propTypes = {
  clMatches: PropTypes.array.isRequired,
};


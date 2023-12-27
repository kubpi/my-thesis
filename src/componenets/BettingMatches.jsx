import {useEffect,useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./BettingMatches.css";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot, where, query, } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { useMatchesData } from "./MatchesDataProvider";
import {
  ReturnTeamImage,
  getTurnamentImgURL,
  getTurnamentImgURLbyId,
  tournaments,
} from "../Services/apiService";
import SearchBar from "./SearchBar";
import RemoveButton from "./RemoveButton";
import FilterButton from "./FilterButton";


const BettingMatches = ({ selectedMatchesId, onBetClick, onSaveBet }) => {
  console.log(selectedMatchesId);
  const [matchesBetting, setMatchesBetting] = useState([])
  const convertDate = (timestamp) => {
    let date = new Date(timestamp * 1000);
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
    let year = date.getFullYear();
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleSaveBet = () => {
    // Call the onSaveBet function passed from TabsBar
    onSaveBet();
  };
  const getTimeUntilMatch = (timestamp) => {
    const matchDate = new Date(timestamp * 1000);
    const today = new Date();
    const timeDiff = matchDate - today;

    if (matchDate.toDateString() === today.toDateString()) {
      // Match is on the same day
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m do rozpoczęcia`;
    } else {
      // Match is on a different day
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24) - 1);
      return `${days} dni do meczu`;
    }
  };

  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    const firestore = getFirestore();
    const unsubscribeFromSnapshots = [];
    const matches = {};

    selectedMatchesId.forEach((match) => {
      console.log(match)
      tournaments.forEach((tournament) => {
        const matchesRef = collection(firestore, `matchesData/${tournament.name}/matches`);
        const q = query(matchesRef, where("id", "==", match.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let newMatches = {}
          let matchess = []
          querySnapshot.forEach((doc) => {
            const matchData = doc.data();
            newMatches = { match: matchData, ...match }
            matches[matchData.id] = newMatches;
         
           
        
           
          });
         
       
          setMatchesBetting(Object.values(matches));
        });

        unsubscribeFromSnapshots.push(unsubscribe);
      });
    });

    return () => {
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [selectedMatchesId]);

  
  console.log(matchesBetting)
  return (
    <div className="favorite-matches-container">
      {matchesBetting && matchesBetting.length === 0 ? (
        <p>No favorite matches added.</p>
      ) : (
        <>
          <div className="users-table">
            {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

            <div className="users-table-header">
              <div className="header-item select-column">
                <input type="checkbox" />
              </div>

              <div className="header-item">Liga</div>
              <div className="header-item">
                Gospodarze <div>Goście</div>
              </div>
              <div className="header-item">Obstawiony wynik</div>
              <div className="header-item">Wynik meczu</div>
              <div className="header-item">Data</div>
              <div className="header-item">Status</div>
            </div>
            <div className="users-table-body">
            {matchesBetting.map((user, index) => (
                <div className="table-row " key={user.match.id}>
                  <div className="row-item select-column">
                    <input type="checkbox" />
                  </div>
                  <div className="row-item">
                    <img
                      src={getTurnamentImgURLbyId(
                        user.match.tournament.uniqueTournament.id
                      )}
                      className="team-logo2"
                      alt={user.match.homeTeam.name}
                    ></img>
                    {user.match.tournament.name}
                  </div>
                  <div className="row-item">
                    <div>
                      <img
                        src={ReturnTeamImage(user.match.homeTeam.id)}
                        className="team-logo2"
                        alt={user.match.homeTeam.name}
                      ></img>
                      {user.match.homeTeam.name}
                    </div>
                    <img
                      src={ReturnTeamImage(user.match.awayTeam.id)}
                      className="team-logo2"
                      alt={user.match.awayTeam.name}
                    ></img>
                    {user.match.awayTeam.name}
                  </div>
                  <div className="row-item">
                    {user.match.betPlaced &&
                    !user.betHomeScore &&
                    !user.betAwayScore ? (
                      <>
                        <div>Nieobstawiono</div>
                      </>
                    ) : (
                      <>
                        {user.betHomeScore !== null &&
                        user.betAwayScore !== null ? (
                          <>
                            <div>{user.betHomeScore}</div>
                            <div>{user.betAwayScore}</div>
                            {!user.match.betPlaced ? (
                              <button onClick={() => onBetClick(user.match)}>
                                Edytuj
                              </button>
                            ) : (
                              <div></div>
                            )}
                          </>
                        ) : (
                          <>
                            <button onClick={() => onBetClick(user.match)}>
                              Obstaw mecz
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="row-item">
                    {user.match.homeScore.display && user.match.awayScore.display ? (
                      <>
                        <div>{user.match.homeScore.display}</div>
                        {user.match.awayScore.display}
                      </>
                    ) : (
                      <div>{getTimeUntilMatch(user.match.startTimestamp)}</div>
                    )}
                  </div>
                  <div className="row-item">
                    {convertDate(user.match.startTimestamp)}
                  </div>
                  <div className="row-item">{user.match.status.description}</div>
                </div>
              ))}
            </div>
            <div className="save-all-button-container">
              <button onClick={handleSaveBet} className="save-all-button">
                Zapisz wszystkie
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BettingMatches;

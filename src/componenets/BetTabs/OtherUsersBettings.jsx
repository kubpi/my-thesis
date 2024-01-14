import { useEffect, useState } from "react";
import "../../css//OtherUsersBettings.css";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import PodiumForFriendsBets from "../PodiumForFriendsBets";

const OtherUsersBettings = ({
    user,activeTab,friendGamesTabs,kuba,closestMatch,isBetClosed,allMatchesFinished,totalPoints,convertDate,getTimeUntilMatch
}) => {
    const isCorrectBet = (betScoreHome, betScoreAway, matchScoreHome, matchScoreAway) => {
        const isCorrect = betScoreHome == matchScoreHome && betScoreAway == matchScoreAway;
        console.log({ betScoreHome, betScoreAway, matchScoreHome, matchScoreAway, isCorrect }); // Debugging line
        return isCorrect;
      };
      
  return (
    <>
         <h2 className="podium-title podium-title1">Podsumowanie: </h2>
      <div className="users-table">
        {/* <SearchBar onSearch={setSearchQuery}></SearchBar>
                <div className="buttons-container">
                  <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
                  <FilterButton></FilterButton>
                </div> */}

        <div className="users-table-header">
         

          <div className="header-item">Liga</div>
          <div className="header-item">
            Gospodarze <div>Goście</div>
          </div>
          <div className="header-item">Obstawiony wynik</div>
          {friendGamesTabs &&
            friendGamesTabs?.map(
              (userParticipant) =>
                userParticipant.userUid !== user.uid && (
                  <div className="header-item" key={userParticipant?.userUid}>
                    {userParticipant?.userName}
                  </div>
                )
            )}
          <div className="header-item">Wynik meczu</div>
          {/* <div className="header-item">Data</div> */}

        
        </div>
        <div className="users-table-body">
          {kuba.map((user, index) => (
            <>
              <div className="table-row " key={user.match.id}>
                
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
                <div className={`row-item`}>
                  <>
                    {user.betHomeScore !== null &&
                    user.betAwayScore !== null ? (
                      <>
                        <div className={` ${isCorrectBet(user.betHomeScore, user.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{user.betHomeScore}</div>
                        <div className={` ${isCorrectBet(user.betHomeScore, user.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{user.betAwayScore}</div>
                      </>
                    ) : (
                      <div>Nieobstawiono</div>
                    )}
                  </>
                </div>
                {user?.mecze?.map((mecz, index) =>
                  mecz.betHomeScore && mecz.betAwayScore ? (
                    <div className={`row-item `} key={index}>
                            <div className={`${isCorrectBet(mecz.betHomeScore, mecz.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{mecz.betHomeScore}</div>
                      <div className={`${isCorrectBet(mecz.betHomeScore, mecz.betAwayScore, user.match.homeScore.display, user.match.awayScore.display) ? 'correct-bet' : ''}`}>{mecz.betAwayScore}</div>
                    </div>
                  ) : (
                    <div>Nieobstawiono</div>
                  )
                )}

                <div className="row-item">
                  {user.match.status.type !== "notstarted" ? (
                    <>
                      <div>{user.match.homeScore.display}</div>
                      {user.match.awayScore.display}
                    </>
                  ) : (
                    <div>{getTimeUntilMatch(user.match.startTimestamp)} </div>
                  )}
                </div>
                {/* <div className="row-item">
                  {convertDate(user.match.startTimestamp)}
                </div> */}

              
              </div>
            </>
          ))}
        </div>
       
      </div>
  
   
    </>
  );
};

export default OtherUsersBettings;

import {useState,useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./BettingView.css";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { useMatchesData } from "./MatchesDataProvider";
import {
  ReturnTeamImage,
  getTurnamentImgURL,
  getTurnamentImgURLbyId,
  tournaments,
} from "../Services/apiService";
import { DateSlider } from "./DateSlider";

export function BettingViewTableBody({
    matchesData,
    selectedMatches,
    handleCheckboxChange,
    convertDate
}) {

    return (
        <div className="users-table-body">
            {Object.keys(matchesData).map((tournamentName) => {
          
                return matchesData[tournamentName].map((user) => (
                    <div className="table-row" key={user.id}>
                        <div className="row-item select-column">
                            <input
                                type="checkbox"
                                checked={selectedMatches.includes(user)}
                                onChange={() => handleCheckboxChange(user)}
                            ></input>
                        </div>
                        <div className="row-item">
                            <img
                                src={getTurnamentImgURLbyId(
                                    user.tournament.uniqueTournament.id
                                )}
                                className="team-logo2"
                                alt={user.tournament.name}
                            />
                            {user.tournament.name}
                        </div>
                        <div className="row-item">
                            <div>
                                <img
                                    src={ReturnTeamImage(user.homeTeam.id)}
                                    className="team-logo2"
                                    alt={user.homeTeam.name}
                                />
                                {user.homeTeam.name}
                            </div>
                            <img
                                src={ReturnTeamImage(user.awayTeam.id)}
                                className="team-logo2"
                                alt={user.awayTeam.name}
                            />
                            {user.awayTeam.name}
                        </div>
                        <div className="row-item">
                            {convertDate(user.startTimestamp)}
                        </div>
                        <div className="row-item">{user.status.description}</div>
                    </div>
                ));
            })}
        </div>
    )
}

export default BettingViewTableBody;

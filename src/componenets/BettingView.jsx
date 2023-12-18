import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './BettingView.css';
import { useMatchesData } from './MatchesDataProvider';
import { ReturnTeamImage, getTurnamentImgURL } from '../Services/apiService';

const BettingView = ({ isOpen, onClose, onAddTab }) => {
    const [tabName, setTabName] = React.useState('');
    const { allMatchesData } = useMatchesData();

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tabName.trim()) {
            onAddTab(tabName.trim());
            setTabName('');
            onClose();
        } else {
            alert("Tab name cannot be empty.");
        }
    };

    const convertDate = (timestamp) => {
        let date = new Date(timestamp * 1000);
        let day = date.getDate().toString().padStart(2, "0");
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let year = date.getFullYear();
        let hours = date.getHours().toString().padStart(2, "0");
        let minutes = date.getMinutes().toString().padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };
    const getUpcomingMatches = (allMatches) => {
        // Assuming that allMatches is an object with tournament names as keys
        // and arrays of match objects as values
        const upcomingMatches = {};
        Object.keys(allMatches).forEach((tournament) => {
          upcomingMatches[tournament] = allMatches[tournament].filter(
            (match) => match.status.type === 'notstarted'
          );
        });
        return upcomingMatches;
      };
    
    const bettingViewData = getUpcomingMatches(allMatchesData);
    
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Betting View</h2>
                <input
                    type="text"
                    placeholder="Tab name"
                    value={tabName}
                    onChange={(e) => setTabName(e.target.value)}
                />
                <button onClick={handleSubmit}>Add</button>
                <button onClick={onClose}>Cancel</button>
                <button className="close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="users-table">
                    <div className="users-table-header">
                        <div className="header-item select-column">
                            <input type="checkbox" />
                        </div>
                        <div className="header-item">Liga</div>
                        <div className="header-item">Gospodarze <div>Goście</div></div>
                        <div className="header-item">Wynik</div>
                        <div className="header-item">Data</div>
                        <div className="header-item">Status</div>
                    </div>
                    <div className="users-table-body">
                        {Object.keys(bettingViewData).map((tournamentName) => {
                            return bettingViewData[tournamentName].map((user) => (
                                <div className="table-row" key={user.id}>
                                    <div className="row-item select-column">
                                        <input type="checkbox" />
                                    </div>
                                    <div className="row-item">
                                        <img src={getTurnamentImgURL(user.tournament.uniqueTournament.id)} className="team-logo" alt={user.tournament.name} />
                                        {user.tournament.name}
                                    </div>
                                    <div className="row-item">
                                        <div>
                                            <img src={ReturnTeamImage(user.homeTeam.id)} className="team-logo" alt={user.homeTeam.name} />
                                            {user.homeTeam.name}
                                        </div>
                                        <img src={ReturnTeamImage(user.awayTeam.id)} className="team-logo" alt={user.awayTeam.name} />
                                        {user.awayTeam.name}
                                    </div>
                                    <div className="row-item">
                                        <div>{user.homeScore.display}</div>
                                        {user.awayScore.display}
                                    </div>
                                    <div className="row-item">
                                        {convertDate(user.startTimestamp)}
                                    </div>
                                    <div className="row-item">{user.status.description}</div>
                                </div>
                            ));
                        })}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default BettingView;

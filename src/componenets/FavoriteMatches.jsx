import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { FavoritesContext } from "./FavoritesContext";
import RemoveButton from "./RemoveButton";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import './CustomTable3.css';


export function FavoriteMatches() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [checkedIds, setCheckedIds] = useState([]);

  const handleCheckboxChange = (matchId) => {
    setCheckedIds((prevCheckedIds) =>
      prevCheckedIds.includes(matchId)
        ? prevCheckedIds.filter((id) => id !== matchId)
        : [...prevCheckedIds, matchId]
    );
  };
  const handleMasterCheckboxChange = (e) => {
    if (e.target.checked) {
      setCheckedIds(favorites.map((match) => match.id)); // Add all match IDs to checkedIds
    } else {
      setCheckedIds([]); // Clear all selections
    }
  };

  const handleRemoveClick = () => {
    removeFavorite(checkedIds);
    setCheckedIds([]);
  };
  return (
    <div className="favorite-matches-container">
      {favorites.length === 0 ? (
        <p>No favorite matches added.</p>
      ) : (
        <>
          <div className="users-table">
                          <SearchBar></SearchBar>
                          <div className="buttons-container">
                          <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
            <FilterButton></FilterButton>
                          </div>
           
            <div className="users-table-header">
              <div className="header-item select-column">
                <input
                  type="checkbox"
                  onChange={handleMasterCheckboxChange}
                  checked={checkedIds.length === favorites.length}
                />
              </div>

              <div className="header-item">Liga</div>
              <div className="header-item">
                Gospodarze <div>Goście</div>
              </div>
              <div className="header-item">Wynik</div>
              <div className="header-item">Data</div>
              <div className="header-item">Status</div>
            </div>
            <div className="users-table-body">
              {favorites.map((user, index) => (
                <div className="table-row " key={user.id}>
                  <div className="row-item select-column">
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                    />
                  </div>
                  <div className="row-item">{user.tournament.name}</div>
                  <div className="row-item">
                    <div>{user.homeTeam.name}</div>
                    {user.awayTeam.name}
                  </div>
                  <div className="row-item">
                    <div>{user.homeScore.display}</div>
                    {user.awayScore.display}
                  </div>
                  <div className="row-item">{user.startTimestamp}</div>
                  <div className="row-item">{user.status.description}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

FavoriteMatches.propTypes = {
  // If you have any props to pass to this component, define them here
};

export default FavoriteMatches;

// Add styling as needed in your Matches.css

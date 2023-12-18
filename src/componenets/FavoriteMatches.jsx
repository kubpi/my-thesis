import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { FavoritesContext } from "./FavoritesContext";
import RemoveButton from "./RemoveButton";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import "./CustomTable3.css";

import {
    ReturnTeamImage, getTurnamentImgURLbyId
    } from "../Services/apiService";
export function FavoriteMatches() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState(favorites);
  useEffect(() => {
    // Filter matches whenever the searchQuery changes or favorites change
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = favorites.filter((match) => {
      return (
        match.tournament.name.toLowerCase().includes(lowercasedQuery) ||
        match.homeTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.awayTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.status.description.toLowerCase().includes(lowercasedQuery) ||
        // Assuming startTimestamp is in a human-readable format or convert it accordingly
        match.startTimestamp.toString().toLowerCase().includes(lowercasedQuery)
      );
    });
    setFilteredFavorites(filtered);
  }, [searchQuery, favorites]);

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

  const convertDate = (timestamp) => {
    let date = new Date(timestamp * 1000);
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
    let year = date.getFullYear();
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
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
            <SearchBar onSearch={setSearchQuery}></SearchBar>
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
              {filteredFavorites.map((user, index) => (
                <div className="table-row " key={user.id}>
                  <div className="row-item select-column">
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                    />
                  </div>
                  <div className="row-item"><img src={getTurnamentImgURLbyId(user.tournament.uniqueTournament.id)} className="team-logo" alt={user.homeTeam.name}></img>{user.tournament.name}</div>
                  <div className="row-item">
                    <div>
                      <img src={ReturnTeamImage(user.homeTeam.id)} className="team-logo" alt={user.homeTeam.name}></img>
                      {user.homeTeam.name}
                    </div>
                    <img src={ReturnTeamImage(user.awayTeam.id)} className="team-logo" alt={user.awayTeam.name}></img>
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

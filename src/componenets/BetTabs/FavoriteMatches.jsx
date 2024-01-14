import { useState, useEffect, useContext } from "react";
import { FavoritesContext } from "../../Context/FavoritesContext";
import RemoveButton from "./RemoveButton";
import SearchBar from "../SearchingComponents/SearchBar";
import FilterButton from "../SearchingComponents/FilterButton";
import "../../css/FavoriteMatches.css";
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
} from "firebase/firestore";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
export function FavoriteMatches() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesMatches, setFavoritesMatches] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState(favoritesMatches);

  console.log(favoritesMatches);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [tournamentLogos, setTournamentLogos] = useState({});

  const [homeTeamLogo, setHomeTeamLogo] = useState('');
  const [awayTeamLogo, setAwayTeamLogo] = useState('');
  // Fetch tournament logos
  useEffect(() => {
    const fetchTournamentLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches)
      const tournamentIds = favoritesMatches.map(
        (bet) => bet.tournament.uniqueTournament.id
      );
      const uniqueTournamentIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of uniqueTournamentIds) {
        const logoRef = ref(storage, `tournamentsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setTournamentLogos(logoUrls);
    };

    if (favorites.length > 0) {
      fetchTournamentLogos();
    }
  }, [favoritesMatches]);

  useEffect(() => {
    const fetchHomeTeamLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches)
      const tournamentIds = favoritesMatches.map(
        (bet) => bet.homeTeam.id
      );
      const homeTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of homeTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setHomeTeamLogo(logoUrls);
    };

    if (favorites.length > 0) {
      fetchHomeTeamLogos();
    }
  }, [favoritesMatches]);

  useEffect(() => {
    const fetchAwayTeamLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches)
      const tournamentIds = favoritesMatches.map(
        (bet) => bet.awayTeam.id
      );
      const awayTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of awayTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
          // Handle any errors here, such as setting a default image
        }
      }

      setAwayTeamLogo(logoUrls);
    };

    if (favorites.length > 0) {
      fetchAwayTeamLogos();
    }
  }, [favoritesMatches]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // aktualizacja co 1 minutę

    return () => clearInterval(interval); // Czyszczenie interwału
  }, []);

  const getTimeUntilMatch = (timestamp) => {
    const matchDate = new Date(timestamp * 1000);
    const timeDiff = matchDate - currentTime;

    if (matchDate.toDateString() === currentTime.toDateString()) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      if (minutes > 0) {
        return `${hours}h ${minutes}m do rozpoczęcia`;
      }
    } else {
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24) - 1);
      return `${days} dni do meczu`;
    }
  };

  useEffect(() => {
    const firestore = getFirestore();
    const unsubscribeFromSnapshots = [];
    const matches = {};

    favorites.forEach((favoriteId) => {
      tournaments.forEach((tournament) => {
        const matchesRef = collection(
          firestore,
          `matchesData/${tournament.name}/matches`
        );
        const q = query(matchesRef, where("id", "==", favoriteId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const matchData = doc.data();
            matches[matchData.id] = matchData;
          });

          setFavoritesMatches(Object.values(matches));
        });

        unsubscribeFromSnapshots.push(unsubscribe);
      });
    });

    return () => {
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [favorites]);

  useEffect(() => {
    // Filter matches whenever the searchQuery changes or favorites change
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = favoritesMatches.filter((match) => {
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
  }, [searchQuery, favoritesMatches]);

  const handleCheckboxChange = (matchId) => {
    setCheckedIds((prevCheckedIds) =>
      prevCheckedIds.includes(matchId)
        ? prevCheckedIds.filter((id) => id !== matchId)
        : [...prevCheckedIds, matchId]
    );
  };

  const handleMasterCheckboxChange = (e) => {
    if (e.target.checked) {
      setCheckedIds(favoritesMatches.map((match) => match.id)); // Add all match IDs to checkedIds
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
    console.log(checkedIds);
    removeFavorite(checkedIds);
    setCheckedIds([]);
  };

  return (
    <div className="favorite-matches-container">
      {favoritesMatches.length === 0 ? (
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
                  checked={checkedIds.length === favoritesMatches.length}
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
                  <div className="row-item">
                  <img
                      src={
                        tournamentLogos[
                          user.tournament.uniqueTournament.id
                        ]
                      }
                      className="team-logo2"
                      alt={user.homeTeam.name}
                    ></img>
                    {user.tournament.name}
                  </div>
                  <div className="row-item">
                    <div>
                       <img
                      src={
                        homeTeamLogo[
                          user.homeTeam.id
                        ]
                      }
                      className="team-logo2"
                      alt={user.homeTeam.name}
                    ></img>
                      {user.homeTeam.name}
                    </div>
                    <img
                      src={
                        awayTeamLogo[
                          user.awayTeam.id
                        ]
                      }
                      className="team-logo2"
                      alt={user.awayTeam.name}
                    ></img>
                    {user.awayTeam.name}
                  </div>
                  <div className="row-item">
                    {user.status.type !== "notstarted" ? (
                      <>
                        <div>{user.homeScore.display}</div>
                        {user.awayScore.display}
                      </>
                    ) : (
                      <div>{getTimeUntilMatch(user.startTimestamp)} </div>
                    )}
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

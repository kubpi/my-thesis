import { useState, useEffect, useContext } from "react";
import { FavoritesContext } from "../../Context/FavoritesContext";
import RemoveButton from "./RemoveButton";
import SearchBar from "../SearchingComponents/SearchBar";
import "../../css/FavoriteMatches.css";
import { Oval } from "react-loader-spinner";
import {
  getFirestore,
  collection,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import { tournaments } from "../../Services/apiService";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
export function FavoriteMatches() {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesMatches, setFavoritesMatches] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState(favoritesMatches);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tournamentLogos, setTournamentLogos] = useState({});
  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");

  const onImageLoad = () => {
    setLoadedImageCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (loadedImageCount === favoritesMatches.length * 3) {
      setTimeout(() => {
        setAllImagesLoaded(true);
      }, 700);
    }
  }, [loadedImageCount, favoritesMatches.length]);

  useEffect(() => {
    const fetchTournamentLogos = async () => {
      const storage = getStorage();
      console.log(favoritesMatches);
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
      console.log(favoritesMatches);
      const tournamentIds = favoritesMatches.map((bet) => bet.homeTeam.id);
      const homeTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of homeTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
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
      console.log(favoritesMatches);
      const tournamentIds = favoritesMatches.map((bet) => bet.awayTeam.id);
      const awayTeamIds = [...new Set(tournamentIds)];
      const logoUrls = {};

      for (const id of awayTeamIds) {
        const logoRef = ref(storage, `teamsLogos/${id}.png`);
        try {
          const url = await getDownloadURL(logoRef);
          logoUrls[id] = url;
        } catch (error) {
          console.error("Error fetching tournament logo: ", error);
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
    }, 60000);

    return () => clearInterval(interval);
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
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = favoritesMatches.filter((match) => {
      return (
        match.tournament.name.toLowerCase().includes(lowercasedQuery) ||
        match.homeTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.awayTeam.name.toLowerCase().includes(lowercasedQuery) ||
        match.status.description.toLowerCase().includes(lowercasedQuery) ||
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
      setCheckedIds(favoritesMatches.map((match) => match.id));
    } else {
      setCheckedIds([]);
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

  const handleRemoveClick = () => {
    console.log(checkedIds);
    removeFavorite(checkedIds);
    setCheckedIds([]);
  };

  return (
    <div className="favorite-matches-container">
      {favoritesMatches.length === 0 ? (
        <p>Brak meczy ulubionych.</p>
      ) : (
        <>
          {allImagesLoaded ? (
            <div className={`users-table ${allImagesLoaded ? "fade-in" : ""}`}>
              <SearchBar onSearch={setSearchQuery}></SearchBar>
              <div className="buttons-container">
                <RemoveButton onClick={handleRemoveClick}></RemoveButton>{" "}
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
                  <div
                    className="table-row fade-in-up"
                    key={user.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
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
                          tournamentLogos[user.tournament.uniqueTournament.id]
                        }
                        onLoad={onImageLoad}
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      ></img>
                      {user.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>
                        <img
                          src={homeTeamLogo[user.homeTeam.id]}
                          onLoad={onImageLoad}
                          className="team-logo2"
                          alt={user.homeTeam.name}
                        ></img>
                        {user.homeTeam.name}
                      </div>
                      <img
                        src={awayTeamLogo[user.awayTeam.id]}
                        onLoad={onImageLoad}
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
          ) : (
            <div className="loader-container">
              <Oval color="#466551" height={80} width={80} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FavoriteMatches;

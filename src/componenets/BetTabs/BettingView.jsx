import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../css/BettingView.css";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../../Services/apiService";
import { DateSlider } from "../Slider/DateSlider";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export function BettingView({
  isOpen,
  onClose,
  selectedMatches,
  setSelectedMatches,
  onAddTab,
  teamUsers,
}) {
  const [tabCount, setTabCount] = useState(1); // Stan do śledzenia liczby zakładek
  const [tabName, setTabName] = useState("Zakład");
  const localData = localStorage.getItem("daysWithNoMatches");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apiFormatDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const apiFormatNextDate = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(apiFormatDate);
  const [selectedNextDate, setSelectedNextDate] = useState(apiFormatNextDate);

  const [matchesData, setMatchesData] = useState();

  const [tournamentLogos, setTournamentLogos] = useState({});
  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");
  useEffect(() => {
    const savedLogos =
      JSON.parse(localStorage.getItem("tournamentLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    // Loop through the tournaments and matches to fetch logos
    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const tournamentId = bet.tournament.uniqueTournament.id;
          if (!savedLogos[tournamentId]) {
            const logoRef = ref(
              storage,
              `tournamentsLogos/${tournamentId}.png`
            );
            fetchLogoPromises.push(
              getDownloadURL(logoRef)
                .then((url) => {
                  savedLogos[tournamentId] = url;
                  return [tournamentId, url];
                })
                .catch((error) => {
                  console.error(
                    `Error fetching logo for tournamentId: ${tournamentId}`,
                    error
                  );
                  return [tournamentId, "default_logo_url.png"]; // Fallback to default logo URL
                })
            );
          }
        });
      });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("tournamentLogos", JSON.stringify(newLogos));
      setTournamentLogos(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setTournamentLogos(savedLogos);
    }
  }, [matchesData]); // Make sure to include the dependency array here

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];
    // Loop through the tournaments and matches to fetch logos
    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const homeTeamId = bet.homeTeam.id;
          if (!savedLogos[homeTeamId]) {
            const logoRef = ref(storage, `teamsLogos/${homeTeamId}.png`);
            fetchLogoPromises.push(
              getDownloadURL(logoRef)
                .then((url) => {
                  savedLogos[homeTeamId] = url;
                  return [homeTeamId, url];
                })
                .catch((error) => {
                  console.error(
                    `Error fetching logo for teamId: ${homeTeamId}`,
                    error
                  );
                  // Optionally set a default logo URL
                  return [homeTeamId, "default_logo_url.png"];
                })
            );
          }
        });
      });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("teamsLogos", JSON.stringify(newLogos));
      setHomeTeamLogo(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setHomeTeamLogo(savedLogos);
    }
  }, [matchesData]);

  useEffect(() => {
    const savedLogos = JSON.parse(localStorage.getItem("teamsLogos")) || {};
    const storage = getStorage();
    const fetchLogoPromises = [];

    matchesData &&
      Object.keys(matchesData).forEach((tournamentName) => {
        matchesData[tournamentName].forEach((bet) => {
          const awayTeamId = bet.awayTeam.id;
          if (!savedLogos[awayTeamId]) {
            const logoRef = ref(storage, `teamsLogos/${awayTeamId}.png`);
            fetchLogoPromises.push(
              getDownloadURL(logoRef)
                .then((url) => {
                  savedLogos[awayTeamId] = url;
                  return [awayTeamId, url];
                })
                .catch((error) => {
                  console.error(
                    `Error fetching logo for teamId: ${awayTeamId}`,
                    error
                  );
                  // Optionally set a default logo URL
                  return [awayTeamId, "default_logo_url.png"];
                })
            );
          }
        });
      });

    Promise.all(fetchLogoPromises).then((results) => {
      const newLogos = results.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, savedLogos);

      localStorage.setItem("teamsLogos", JSON.stringify(newLogos));
      setAwayTeamLogo(newLogos);
    });

    // If logos are already saved, set them directly
    if (Object.keys(savedLogos).length > 0) {
      setAwayTeamLogo(savedLogos);
    }
  }, [matchesData]);

  useEffect(() => {
    // Ustawienie domyślnej nazwy zakładki
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}.${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${today.getFullYear()}`;
    setTabName(`${formattedDate} Zakład ${tabCount}`);
  }, [tabCount]); // Ustawienie zależności od tabCount, aby aktualizować nazwę przy zmianie liczby zakładek

  // Function to handle the checkbox change
  const handleCheckboxChange = (matchId) => {
    setSelectedMatches((prevSelectedMatches) => {
      if (prevSelectedMatches.includes(matchId)) {
        // If the match is already selected, remove it from the array
        return prevSelectedMatches.filter((id) => id !== matchId);
      } else {
        // If the match is not selected, add it to the array
        return [...prevSelectedMatches, matchId];
      }
    });
  };

  // Function to handle the Save button click
  const handleSave = () => {
    if (tabName.trim() && selectedMatches.length > 0) {
      // Call onAddTab with the selected matches and the ID(s) of the other user(s)
      const selectedUserIds = teamUsers.map((user) => user.uid);
      onAddTab(tabName.trim(), selectedMatches, selectedUserIds, teamUsers);
      setTabCount(tabCount + 1); // Update the tab count state
      setTabName(""); // Reset the tab name state
      setSelectedMatches([]); // Clear the selected matches state
      onClose(); // Close the BettingView modal
    } else {
      alert("Please enter a tab name and select at least one match.");
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

  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty
  };

  useEffect(() => {
    const firestore = getFirestore();
    const leagues = [];
    const allMatches = {};

    tournaments.forEach((tournament) => {
      leagues.push(tournament.name);
    });

    const fetchData = () => {
      const unsubscribeFromSnapshots = leagues.map((league) => {
        const matchesRef = collection(
          firestore,
          `matchesData/${league}/matches`
        );
        const selectedDateObj = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const q = query(
          matchesRef,
          where("startTimestamp", ">=", selectedDateObj.getTime() / 1000),
          where("startTimestamp", "<=", endDate.getTime() / 1000),
          where("status.type", "==", "notstarted")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const matches = [];
          querySnapshot.forEach((doc) => {
            matches.push(doc.data());
          });
          allMatches[league] = matches;
          setMatchesData({ ...allMatches });
        });

        return unsubscribe;
      });

      // Czyszczenie subskrypcji
      return () => {
        unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
      };
    };

    // Wywołaj fetchData na starcie oraz gdy selectedDate się zmienia
    const unsubscribe = fetchData();

    return () => {
      unsubscribe();
    };
  }, [selectedDate]);
  console.log(matchesData);
  if (!isOpen) {
    return null; // This should prevent BettingView from rendering if isOpen is false
  }
  return (
    <div className="modal-backdrop">
      <div className="modal-content ">
        <h2 className="betting-text-style">Wybierz mecze do obstawiania</h2>
        <input
          className="textView"
          placeholder="Tab name"
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
        />

        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={localData}
          timeBackNumber={0}
        />
        <div className="users-table">
          <div className="users-table-header betting-text-style">
            <div className="header-item select-column">
              <input type="checkbox" />
            </div>
            <div className="header-item">Liga</div>
            <div className="header-item">
              Gospodarze <div>Goście</div>
            </div>
            <div className="header-item">Data</div>
            <div className="header-item">Status</div>
          </div>
          <div className="users-table-body  betting-text-style">
            {matchesData &&
              Object.keys(matchesData).map((tournamentName) => {
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
                        src={
                          tournamentLogos[user.tournament.uniqueTournament.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      />
                      {user.tournament.name}
                    </div>
                    <div className="row-item">
                      <div>              
                      <img
                        src={
                          homeTeamLogo[user.homeTeam.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
                      />
                        {user.homeTeam.name}
                      </div>
                      <img
                        src={
                          awayTeamLogo[user.awayTeam.id]
                        }
                        className="team-logo2"
                        alt={user.homeTeam.name}
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
        </div>
        <button onClick={handleSave}>Zapisz</button>
      </div>
    </div>
  );
}

export default BettingView;

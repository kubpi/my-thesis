import {useState,useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./BettingView.css";
import { getFirestore, collection, query, where,onSnapshot } from 'firebase/firestore';
import { useMatchesData } from "./MatchesDataProvider";
import {
  ReturnTeamImage,
  getTurnamentImgURLbyId,
  tournaments,
} from "../Services/apiService";
import { DateSlider } from "./DateSlider";

export function BettingView ({
  isOpen,
  onClose,
  selectedMatches,
  setSelectedMatches,
  onAddTab,
}) {
  const [tabName, setTabName] = useState("");
  const { daysWithNoMatches } = useMatchesData();

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

  const [matchesData,setMatchesData] = useState()
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
      // Call the onAddTab function with the new tab name and the selected matches
      onAddTab(tabName.trim(), selectedMatches);
      // Reset the state
      setTabName("");
      setSelectedMatches([]);

      onClose(); // Close the modal
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

    tournaments.forEach(tournament => {
      leagues.push(tournament.name);
    });

    const fetchData = () => {
      const unsubscribeFromSnapshots = leagues.map((league) => {
        const matchesRef = collection(firestore, `matchesData/${league}/matches`);
        const selectedDateObj = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const q = query(
          matchesRef,
          where("startTimestamp", ">=", selectedDateObj.getTime() / 1000),
          where("startTimestamp", "<=", endDate.getTime() / 1000)
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
        unsubscribeFromSnapshots.forEach(unsubscribe => unsubscribe());
      };
    };

    // Wywołaj fetchData na starcie oraz gdy selectedDate się zmienia
    const unsubscribe = fetchData();
  
    return () => {
      unsubscribe();
    };
   }, [selectedDate]);
  console.log(matchesData)
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Wybierz mecze do obstawiania</h2>
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
          disabledDates={daysWithNoMatches}
          timeBackNumber={0}
        />
        <div className="users-table">
          <div className="users-table-header">
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
          <div className="users-table-body">
            {matchesData && (Object.keys(matchesData).map((tournamentName) => {
          
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
            }))}
          </div>
        </div>
        <button onClick={handleSave}>Zapisz</button>
      </div>
    </div>
  );
};

export default BettingView;

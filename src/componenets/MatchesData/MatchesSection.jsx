import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect, useContext } from "react";
import { DateSlider } from "../Slider/DateSlider";
import {
  getTurnamentImgURL,
  divideMatchesToLeagues,
  tournaments,
  tournamentIds,
  addMatchesTotempAllMatchesData,
  getAllMatchesDays,
  filterMatchesByDate,
  getDaysWithoutMatches,
  sendMatches,
} from "../../Services/apiService";
import "../../css/Matches.css";
import { FavoritesContext } from "../../Context/FavoritesContext";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export function MatchesSection() {
  const { addFavorite, removeFavorite, favorites, removeFavoriteid } =
    useContext(FavoritesContext);
  const [matchesData, setMatchesData] = useState({});
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
  const [selectedLeague, setSelectedLeague] = useState("");

  // Adres URL endpointu, na który będą wysyłane mecze
  const endpoint = "http://localhost:3000/";
  const handleLeagueSelect = (event) => {
    setSelectedLeague(event.target.value);
  };

  useEffect(() => {
    const firestore = getFirestore();
    const fetchDaysWithNoMatches = async () => {
      // First, try to load the data from localStorage

      if (localData) {
        // If data is found in localStorage, parse it and use it directly
        const daysWithNoMatchesData = JSON.parse(localData);
        console.log("Loaded from localStorage:", daysWithNoMatchesData);
        // Here you can set state or perform other operations with daysWithNoMatchesData
      } else {
        // If not found in localStorage, fetch from Firestore
        const daysWithNoMatchesRef = doc(
          firestore,
          "matchesData",
          "daysWithNoMatches"
        );
        try {
          const docSnap = await getDoc(daysWithNoMatchesRef);
          if (docSnap.exists()) {
            // Save the data to localStorage for future access
            localStorage.setItem(
              "daysWithNoMatches",
              JSON.stringify(docSnap.data().dates)
            );
            console.log(
              "Fetched from Firestore and saved to localStorage:",
              docSnap.data().dates
            );
            // Here you can set state or perform other operations with docSnap.data().dates
          } else {
            console.log("No such document in Firestore!");
          }
        } catch (error) {
          console.error(
            "Error fetching days with no matches from Firestore:",
            error
          );
        }
      }
    };

    fetchDaysWithNoMatches();
  }, []); // The empty dependency array ensures this effect runs once when the component mounts

  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty
  };

  useEffect(() => {
    const firestore = getFirestore();
    const leagues = [];
    const allMatches = {};

    tournaments.map((tournament) => {
      leagues.push(tournament.name);
    });
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
      unsubscribeFromSnapshots.forEach((unsubscribe) => unsubscribe());
    };
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date();

    const formattedToday = today.toISOString().split("T")[0];

    //console.log(formattedToday);

    // Sprawdź, czy selectedDate jest dzisiejszą datą i wyślij mecze, jeśli tak
    if (selectedDate === formattedToday) {
      console.log(matchesData);
      sendMatches(matchesData, endpoint)
        .then((data) => {
          console.log("Dane zostały wysłane i otrzymano odpowiedź:", data);
        })
        .catch((error) => {
          console.error("Wystąpił błąd:", error);
        });
    }
  }, [selectedDate, matchesData]);

  console.log(matchesData);

  const isMatchFavorite = (matchId) => {
    return favorites.some((m) => m === matchId);
  };

  return (
    <>
      <div className="slider-margin-top" id="matchesSection">
      <select className="select-league" value={selectedLeague} onChange={handleLeagueSelect}>
          <option value="">Wszystkie mecze</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.name}>
              {tournament.name}
            </option>
          ))}
        </select>
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={localData}
          timeBackNumber={120}
        />
        
      </div>
      <div className="container">
        <div className="row">
          {tournaments
            .filter(
              (tournament) =>
                selectedLeague === "" || tournament.name === selectedLeague
            )
            .map((tournament) => {
              const tournamentMatches = matchesData[tournament.name];
              if (tournamentMatches?.length > 0) {
                return (
                  <div
                    className="col-md-auto d-flex justify-content-center mb-5 mt-4"
                    key={tournament.id}
                  >
                    <CardBoxForMatches
                      matches={tournamentMatches}
                      tournamentId={tournament.id}
                      addToFavorites={addFavorite}
                      removeFromFavorites={removeFavoriteid}
                      isFavorite={(matchId) => isMatchFavorite(matchId)}
                    />
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </>
  );
}

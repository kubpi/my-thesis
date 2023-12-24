import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect, useContext } from "react";
import { DateSlider } from "./DateSlider";
import {
  getTurnamentImgURL,
  divideMatchesToLeagues,tournaments,tournamentIds,addMatchesTotempAllMatchesData, getAllMatchesDays, filterMatchesByDate,getDaysWithoutMatches 
} from "../Services/apiService";
import "./Matches.css";
import { FavoritesContext } from "./FavoritesContext";
import { useMatchesData } from "./MatchesDataProvider";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';




export function MatchesSection() {

  const { addFavorite, removeFavorite, favorites, removeFavoriteid } = useContext(FavoritesContext);
  const [matchesData, setMatchesData] = useState({});
  const localData = localStorage.getItem('daysWithNoMatches');
  useEffect(() => {
    const firestore = getFirestore();
    const fetchDaysWithNoMatches = async () => {
      // First, try to load the data from localStorage
     
      if (localData) {
        // If data is found in localStorage, parse it and use it directly
        const daysWithNoMatchesData = JSON.parse(localData);
        console.log('Loaded from localStorage:', daysWithNoMatchesData);
        // Here you can set state or perform other operations with daysWithNoMatchesData
      } else {
        // If not found in localStorage, fetch from Firestore
        const daysWithNoMatchesRef = doc(firestore, "matchesData", "daysWithNoMatches");
        try {
          const docSnap = await getDoc(daysWithNoMatchesRef);
          if (docSnap.exists()) {
            // Save the data to localStorage for future access
            localStorage.setItem('daysWithNoMatches', JSON.stringify(docSnap.data().dates));
            console.log('Fetched from Firestore and saved to localStorage:', docSnap.data().dates);
            // Here you can set state or perform other operations with docSnap.data().dates
          } else {
            console.log("No such document in Firestore!");
          }
        } catch (error) {
          console.error("Error fetching days with no matches from Firestore:", error);
        }
      }
    };
  
    fetchDaysWithNoMatches();
  }, []); // The empty dependency array ensures this effect runs once when the component mounts
  



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

  
  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty
  };

  useEffect(() => {
    const fetchMatchesForLeagues = async (selectedDate) => {
      const firestore = getFirestore();
      const leagues = ['laLiga', 'premierLeague', /* other leagues */];
      const allMatches = {};
  
      for (const league of leagues) {
        const matchesRef = collection(firestore, `matchesData/${league}/matches`);
        const selectedDateObj = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
  
        const q = query(
          matchesRef,
          where("startTimestamp", ">=", selectedDateObj.getTime() / 1000),
          where("startTimestamp", "<=", endDate.getTime() / 1000)
        );
  
        try {
          const querySnapshot = await getDocs(q);
          const matches = [];
          querySnapshot.forEach((doc) => {
            matches.push(doc.data());
          });
          allMatches[league] = matches;
        } catch (error) {
          console.error(`Error fetching matches from ${league}:`, error);
        }
      }
  
      setMatchesData(allMatches);
    };
  
    fetchMatchesForLeagues(selectedDate);
  }, [selectedDate]);
  
  console.log(matchesData);
  


const isMatchFavorite = (matchId) => {
  return favorites.some((m) => m.id === matchId);
};

 
  return (
    <>
      <div className="slider-margin-top">
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={localData}
          timeBackNumber = {120}
        />
      </div>
      <div className="container">
        <div className="row">
          {tournaments
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
                      img={getTurnamentImgURL(tournament.name)}
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

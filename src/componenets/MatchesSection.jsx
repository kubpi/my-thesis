import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect, useContext } from "react";
import { DateSlider } from "./DateSlider";
import {
  getTurnamentImgURL,
  fetchAllMatchesLive,
  divideMatchesToLeagues,tournaments,tournamentIds,addMatchesTotempAllMatchesData, getAllMatchesDays, filterMatchesByDate,getDaysWithoutMatches 
} from "../Services/apiService";
import "./Matches.css";
import { FavoritesContext } from "./FavoritesContext";
import { useMatchesData } from "./MatchesDataProvider";




export function MatchesSection() {

  const { addFavorite, removeFavorite, favorites,removeFavoriteid } = useContext(FavoritesContext);
const { allMatchesData,setAllMatchesData,liveMatches,daysWithNoMatches } = useMatchesData()

  //const [daysWithNoMatches, setDaysWithNoMatches] = useState([]);
  //const [allMatchesData, setAllMatchesData] = useState({}); // przechowuje wszystkie mecze
  const [matchesData, setMatchesData] = useState({});
  //const [liveMatches, setLiveMatches] = useState([]);
  const [lastMatches, setLastMatches] = useState([]);
  
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
    const filteredMatches = filterMatchesByDate(allMatchesData, selectedDate);
    setMatchesData(filteredMatches);
  }, [selectedDate, allMatchesData]);

  console.log(allMatchesData);


const isMatchFavorite = (matchId) => {
  return favorites.some((m) => m.id === matchId);
};

  console.log(liveMatches);
  console.log(allMatchesData)
  return (
    <>
      <div className="slider-margin-top">
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={daysWithNoMatches}
          timeBackNumber = {120}
        />
      </div>
      <div className="container">
        <div className="row">
          {tournaments
            .sort(
              (a, b) =>
                (matchesData[b.name]?.length || 0) -
                (matchesData[a.name]?.length || 0)
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

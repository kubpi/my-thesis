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

  // useEffect(() => {
  //   let updatedAllMatchesData = {}; // Deklaracja poza zakresem funkcji fetchAllMatchesLive

  //   fetchAllMatchesLive().then((liveMatches) => {
  //     //console.log(liveMatches.events);
  //     const filteredLiveMatches = liveMatches.events.filter((event) =>
  //       tournamentIds.includes(event?.tournament?.uniqueTournament?.id)
  //     );

  //     // Aktualizacja tempAllMatchesData z nowymi meczami na żywo
  //     updatedAllMatchesData = { ...allMatchesData };
  //     filteredLiveMatches.forEach((liveMatch) => {
  //       const tournamentName = tournaments.find(
  //         (t) => t.id === liveMatch.tournament.uniqueTournament.id
  //       ).name;
  //       if (!updatedAllMatchesData[tournamentName]) {
  //         updatedAllMatchesData[tournamentName] = [];
  //       }
  //       // Sprawdzanie, czy mecz już istnieje w updatedAllMatchesData
  //       if (
  //         !updatedAllMatchesData[tournamentName].some(
  //           (match) => match.id === liveMatch.id
  //         )
  //       ) {
  //         updatedAllMatchesData[tournamentName].unshift(liveMatch);
  //       }
  //     });

  //     // console.log(updatedAllMatchesData)
  //     setLiveMatches(liveMatches.events); // Zakładam, że odpowiedź zawiera pole 'events'
  //   });

  //   const fetchMatches = async () => {
  //     const nextMatchesPromises = divideMatchesToLeagues("next");
  //     const lastMatchesPromises = divideMatchesToLeagues("last");

  //     let tempLastAllMatchesData = {};
  //     let tempAllMatchesData = {};

  //     Promise.all(lastMatchesPromises)
  //       .then((allMatchesResults) => {
  //         allMatchesResults.forEach((result) => {
  //           tempLastAllMatchesData[result.name] = result.matches.reduce(
  //             (acc, curr) => {
  //               return acc.concat(curr.events);
  //             },
  //             []
  //           );

  //           // console.log(tempLastAllMatchesData)
  //         });
  //       })

  //       .then(() => Promise.all(nextMatchesPromises))
  //       .then((results) => {
  //         let allMatchDates = [];

  //         results.forEach((result) => {
  //           tempAllMatchesData[result.name] = result.matches.reduce(
  //             (acc, curr) => {
  //               return acc.concat(curr.events);
  //             },
  //             []
  //           );

  //           tempAllMatchesData = addMatchesTotempAllMatchesData(tempAllMatchesData, tempLastAllMatchesData,"push");
  //           tempAllMatchesData = addMatchesTotempAllMatchesData(tempAllMatchesData, updatedAllMatchesData,"unshift");
  //           console.log(tempLastAllMatchesData);
           

  //           allMatchDates = getAllMatchesDays(tempAllMatchesData[result.name],allMatchDates)
  //         });


  //         console.log(allMatchDates);        
  //         const daysWithoutMatches = getDaysWithoutMatches(allMatchDates)

  //         console.log(tempAllMatchesData);

  //         setAllMatchesData(tempAllMatchesData);
  //         setDaysWithNoMatches(daysWithoutMatches);
  //       })
  //       .catch((error) => console.error("Error fetching matches data:", error));
  //   };
  //   fetchMatches();
  // }, []);
  
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

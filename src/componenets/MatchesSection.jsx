import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";
import { DateSlider } from "./DateSlider";
import {
  getTurnamentImgURL,
  fetchAllMatchesLive,
  divideMatchesToLeagues,tournaments,tournamentIds
} from "../Services/apiService";
import "./Matches.css";


const addMatchesTotempAllMatchesData = function (tempAllMatchesData, arr, pushOrUnshift) {
  Object.keys(arr).forEach((key) => {
    if (tempAllMatchesData[key]) {
      // Dodawanie tylko tych meczów, które jeszcze nie istnieją w tempAllMatchesData
      arr[key].forEach((liveMatch) => {
        if (
          !tempAllMatchesData[key].some(
            (match) => match.id === liveMatch.id
          )
        ) {
          if(pushOrUnshift === "push")
            tempAllMatchesData[key].push(liveMatch);
          else
          tempAllMatchesData[key].unshift(liveMatch);
        }
      });
    } else {
      tempAllMatchesData[key] = arr[key];
    }
  });
  return tempAllMatchesData;
}

const getAllMatchesDays = function (obj,arrayToSaveDates) {
  obj.forEach((match) => {
    const matchDate = new Date(match.startTimestamp * 1000);
    const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
      matchDate.getMonth() + 1
    ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(
      2,
      "0"
    )}`;
    arrayToSaveDates.push(apiFormatMatchDate);
  });
  console.log(arrayToSaveDates)
  return arrayToSaveDates
}

const getDaysWithoutMatches = function (allMatchesDates) {
  const today = new Date();
  const uniqueMatchDates = [...new Set(allMatchesDates)];
  const daysWithoutMatches = Array.from({ length: 218 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 30 + index);
    const apiFormatDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return uniqueMatchDates.includes(apiFormatDate)
      ? null
      : apiFormatDate;
  }).filter(Boolean);
  return daysWithoutMatches
}

export function MatchesSection() {
  const [daysWithNoMatches, setDaysWithNoMatches] = useState([]);
  const [allMatchesData, setAllMatchesData] = useState({}); // przechowuje wszystkie mecze
  const [matchesData, setMatchesData] = useState({});
  const [liveMatches, setLiveMatches] = useState([]);
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

  const filterMatchesByDate = (allData, date) => {
    const newMatchesData = {};

    Object.keys(allData).forEach((tournamentName) => {
      newMatchesData[tournamentName] = allData[tournamentName].filter(
        (match) => {
          const matchDate = new Date(match.startTimestamp * 1000);
          const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
            matchDate.getMonth() + 1
          ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
          return apiFormatMatchDate === date;
        }
      );
    });

    return newMatchesData;
  };

  useEffect(() => {
    let updatedAllMatchesData = {}; // Deklaracja poza zakresem funkcji fetchAllMatchesLive

    fetchAllMatchesLive().then((liveMatches) => {
      //console.log(liveMatches.events);
      const filteredLiveMatches = liveMatches.events.filter((event) =>
        tournamentIds.includes(event?.tournament?.uniqueTournament?.id)
      );

      // Aktualizacja tempAllMatchesData z nowymi meczami na żywo
      updatedAllMatchesData = { ...allMatchesData };
      filteredLiveMatches.forEach((liveMatch) => {
        const tournamentName = tournaments.find(
          (t) => t.id === liveMatch.tournament.uniqueTournament.id
        ).name;
        if (!updatedAllMatchesData[tournamentName]) {
          updatedAllMatchesData[tournamentName] = [];
        }
        // Sprawdzanie, czy mecz już istnieje w updatedAllMatchesData
        if (
          !updatedAllMatchesData[tournamentName].some(
            (match) => match.id === liveMatch.id
          )
        ) {
          updatedAllMatchesData[tournamentName].unshift(liveMatch);
        }
      });

      // console.log(updatedAllMatchesData)
      setLiveMatches(liveMatches.events); // Zakładam, że odpowiedź zawiera pole 'events'
    });

    const fetchMatches = async () => {
      const nextMatchesPromises = divideMatchesToLeagues("next");
      const lastMatchesPromises = divideMatchesToLeagues("last");

      let tempLastAllMatchesData = {};
      let tempAllMatchesData = {};

      Promise.all(lastMatchesPromises)
        .then((allMatchesResults) => {
          allMatchesResults.forEach((result) => {
            tempLastAllMatchesData[result.name] = result.matches.reduce(
              (acc, curr) => {
                return acc.concat(curr.events);
              },
              []
            );

            // console.log(tempLastAllMatchesData)
          });
        })

        .then(() => Promise.all(nextMatchesPromises))
        .then((results) => {
          let allMatchDates = [];

          results.forEach((result) => {
            tempAllMatchesData[result.name] = result.matches.reduce(
              (acc, curr) => {
                return acc.concat(curr.events);
              },
              []
            );

            tempAllMatchesData = addMatchesTotempAllMatchesData(tempAllMatchesData, tempLastAllMatchesData,"push");
            tempAllMatchesData = addMatchesTotempAllMatchesData(tempAllMatchesData, updatedAllMatchesData,"unshift");
            console.log(tempLastAllMatchesData);
           

            allMatchDates = getAllMatchesDays(tempAllMatchesData[result.name],allMatchDates)
          });


          console.log(allMatchDates);        
          const daysWithoutMatches = getDaysWithoutMatches(allMatchDates)

          console.log(tempAllMatchesData);

          setAllMatchesData(tempAllMatchesData);
          setDaysWithNoMatches(daysWithoutMatches);
        })
        .catch((error) => console.error("Error fetching matches data:", error));
    };
    fetchMatches();
  }, []);
  
  useEffect(() => {
    const filteredMatches = filterMatchesByDate(allMatchesData, selectedDate);
    setMatchesData(filteredMatches);
  }, [selectedDate, allMatchesData]);

  return (
    <>
      <div className="slider-margin-top">
        <DateSlider
          onDateSelect={handleDateSelect}
          disabledDates={daysWithNoMatches}
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

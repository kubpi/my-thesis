import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";
import { DateSlider } from "./DateSlider";
import "./Matches.css";

const tournaments = [
  { id: 202, name: "Ekstraklasa", season: 52176 },
  { id: 8, name: "LaLiga", season: 52376 },
  { id: 7, name: "ChampionsLeague", season: 52162 },
  { id: 17, name: "PremierLeague", season: 52186 },
  { id: 35, name: "Bundesliga", season: 52608 },
  { id: 23, name: "SerieA", season: 52760 },
  { id: 679, name: "UEFAEuropaLeague", season: 53654 },
  { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
];

const getTurnamentImgURL = function (turnamentName) {
  const turnamentObj = tournaments.find(
    (turnament) => turnament.name === turnamentName
  );
  if (!turnamentObj) return null;
  return `https://api.sofascore.app/api/v1/unique-tournament/${turnamentObj.id}/image/light`;
};

export function MatchesSection() {
  
  const [daysWithNoMatches, setDaysWithNoMatches] = useState([]);
  const [allMatchesData, setAllMatchesData] = useState({}); // przechowuje wszystkie mecze
  const [matchesData, setMatchesData] = useState({});

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
      newMatchesData[tournamentName] = allData[tournamentName].filter((match) => {
        const matchDate = new Date(match.startTimestamp * 1000);
        const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
          matchDate.getMonth() + 1
        ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
        return apiFormatMatchDate === date;
      });
    });

    return newMatchesData;
  };
  
  useEffect(() => {
    if (!selectedDate) return;

    const fetchMatchesPage = async (
      tournament,
      pageNumber = 0,
      accumulatedMatches = []
    ) => {
      const response = await fetch(
        `https://api.sofascore.com/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/events/next/${pageNumber}`
      );

      // Jeśli mamy status 404, zakończ rekursję i zwróć zebrane do tej pory mecze
      if (response.status === 404) {
        return accumulatedMatches;
      }

      try {
        const data = await response.json();

        if (!data || data.length === 0 || pageNumber >= 10) {
          return accumulatedMatches;
        }

        return await fetchMatchesPage(
          tournament,
          pageNumber + 1,
          accumulatedMatches.concat(data)
        );
      } catch (error) {
        console.error(
          "Error fetching page",
          pageNumber,
          "for",
          tournament.name,
          ":",
          error
        );
        return accumulatedMatches;
      }
    };

    const fetchMatches = async () => {
      const allPromises = tournaments.map(async (tournament) => {
        const matches = await fetchMatchesPage(tournament);
        return { ...tournament, matches };
      });

      Promise.all(allPromises)
        .then((results) => {
          const tempAllMatchesData = {};
          const allMatchDates = [];

          results.forEach((result) => {
            tempAllMatchesData[result.name] = result.matches.reduce((acc, curr) => {
              return acc.concat(curr.events);
            }, []);

            tempAllMatchesData[result.name].forEach((match) => {
              const matchDate = new Date(match.startTimestamp * 1000);
              const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
                matchDate.getMonth() + 1
              ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
              allMatchDates.push(apiFormatMatchDate);
            });
          });

          const uniqueMatchDates = [...new Set(allMatchDates)];
          const daysWithoutMatches = Array.from({ length: 218 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index);
            const apiFormatDate = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            return uniqueMatchDates.includes(apiFormatDate) ? null : apiFormatDate;
          }).filter(Boolean);


          
          setAllMatchesData(tempAllMatchesData);
          setDaysWithNoMatches(daysWithoutMatches);
          const filteredMatches = filterMatchesByDate(tempAllMatchesData, selectedDate);
          setMatchesData(filteredMatches);
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
                (matchesData[a.name]?.length || 0) -
                (matchesData[b.name]?.length || 0)
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

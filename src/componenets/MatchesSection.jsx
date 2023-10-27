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


  const today = new Date();
  const apiFormatDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apiFormatNextDate = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(apiFormatDate);
  const [selectedNextDate, setSelectedNextDate] = useState(apiFormatNextDate);

  const handleDateSelect = (date, nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate); // Ustawienie wybranej daty\
  };

  const [matchesData, setMatchesData] = useState({});

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
    const newMatchesData = {};
    const allMatchDates = [];

    results.forEach((result) => {
      newMatchesData[result.name] = result.matches.reduce((acc, curr) => {
        return acc.concat(curr.events);
      }, []);

      newMatchesData[result.name].forEach((match) => {
        const matchDate = new Date(match.startTimestamp * 1000);
        const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
          matchDate.getMonth() + 1
        ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
        allMatchDates.push(apiFormatMatchDate);
      });
    });

    results.forEach((result) => {
      newMatchesData[result.name] = result.matches
        .reduce((acc, curr) => {
          return acc.concat(curr.events);
        }, [])
        .filter((match) => { // Filtruj mecze na podstawie wybranej daty
          const matchDate = new Date(match.startTimestamp * 1000);
          const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
            matchDate.getMonth() + 1
          ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
          return apiFormatMatchDate === selectedDate;
        });
    });
    setMatchesData(newMatchesData);
    const uniqueMatchDates = [...new Set(allMatchDates)];
    const daysWithNoMatches = Array.from({ length: 100 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const apiFormatDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return uniqueMatchDates.includes(apiFormatDate) ? null : apiFormatDate;
    }).filter(Boolean);

    setDaysWithNoMatches(daysWithNoMatches);
    
  })
  .catch((error) => console.error("Error fetching matches data:", error));

    };

    fetchMatches();
  }, [selectedDate]);

  console.log(matchesData);

  const {
    Bundesliga,
    ChampionsLeague,
    Ekstraklasa,
    LaLiga,
    PremierLeague,
    SerieA,
    UEFAEuropaConferenceLeague,
    UEFAEuropLeague,
  } = matchesData;

  console.log(Ekstraklasa);
  // console.log(Bundesliga)

  console.log(getTurnamentImgURL("Ekstraklasa"));
const flattenedMatchesArray = [];
  Object.values(matchesData).forEach((matches) => {
    if (matches?.length > 0) {
      flattenedMatchesArray.push(...matches);
    }
  });

  return (
    <>
     <DateSlider onDateSelect={handleDateSelect} disabledDates={daysWithNoMatches} />

      <div className="container">
        <div className="row">
          {tournaments
            .sort(
              (a, b) =>
                (matchesData[a.name]?.length || 0) - (matchesData[b.name]?.length || 0)
            )
            .map((tournament) => {
              const tournamentMatches = matchesData[tournament.name];
              if (tournamentMatches?.length > 0) {
                return (
                  <div className="col-md-auto d-flex justify-content-center mb-3" key={tournament.id}>
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
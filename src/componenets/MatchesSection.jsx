import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";
import { DateSlider } from "./DateSlider";

export function MatchesSection() {
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
          results.forEach((result) => {
            newMatchesData[result.name] = result.matches.reduce((acc, curr) => {
              return acc.concat(curr.events);
            }, []);

          
           const filteredMatches = newMatchesData[result.name].filter((match) => {
             const matchDate = new Date(match.startTimestamp * 1000);
             
            const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
              matchDate.getMonth() + 1
            ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
            console.log(apiFormatMatchDate === selectedDate)
            // Porównaj datę meczu z wybraną datą
            return apiFormatMatchDate === selectedDate;
           });
           newMatchesData[result.name] = filteredMatches;
          });

          console.log(newMatchesData);
          
         
          setMatchesData(newMatchesData);
s
          console.log(matchesData)
        
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

  console.log(Ekstraklasa)
  // console.log(Bundesliga)


  return (
    <>
      <DateSlider onDateSelect={handleDateSelect} />
      {Ekstraklasa?.length > 0 && (
        <CardBoxForMatches matches={Ekstraklasa}></CardBoxForMatches>
      )}
      {Bundesliga?.length > 0 && (
        <CardBoxForMatches matches={Bundesliga}></CardBoxForMatches>
        )}
    </>
  );
}

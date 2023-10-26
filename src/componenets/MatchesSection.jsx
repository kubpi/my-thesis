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
    if (!selectedDate) return; // Nie rób nic, jeśli data nie została wybrana

    const fetchMatches = async () => {
      const allPromises = tournaments.map((tournament) =>
        fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/events/next/0`
        )
          .then((response) => response.json())

          .then((data) => {
            console.log(data); // Dodaj tę linię, aby zobaczyć, co zwraca API
            return { ...tournament, matches: data };
          })
      );

      Promise.all(allPromises)
        .then((results) => {
          const newMatchesData = {};
          results.forEach((result) => {
            newMatchesData[result.name] = result.matches;
          });
          setMatchesData(newMatchesData);
        })
        .catch((error) => console.error("Error fetching matches data:", error));
    };

    // Call the fetch function
    fetchMatches();
  }, [selectedDate]); // Empty dependency array to ensure it runs once when component mounts

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

  console.log(ChampionsLeague);

  return (
    <>
      <DateSlider onDateSelect={handleDateSelect} />
      <CardBoxForMatches matches={ChampionsLeague}></CardBoxForMatches>
      <CardBoxForMatches matches={Bundesliga}></CardBoxForMatches>
    </>
  );
}

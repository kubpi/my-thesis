import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";
import { DateSlider } from "./DateSlider";

const findMatches = (result, competitionName) =>
  result.matches.filter((match) => match.competition.name === competitionName);

export function MatchesSection() {
  const [data, setData] = useState([]);
  const [championsLeagueMatches, setClMatches] = useState([]);
  const [championshipMatches, setChampionshipmatches] = useState([]);
  const [serieABrazilMatches, setSerieABrazilMatches] = useState([]);
  const [serieAItalyMatches, setSerieAItalyMatches] = useState([]);
  const [bundesligaMatches, setBundesligaMatches] = useState([]);
  const [eredivisieMatches, setEredivisieMatches] = useState([]);
  const [primeraDivisionMatches, setPrimeraDivisionMatches] = useState([]);
  const [ligue1Matches, setLigue1Matches] = useState([]);
  const [primeiraLigaMatches, setPrimeiraLigaMatches] = useState([]);
  const [europeanChampionshipMatches, setEuropeanChampionshipMatches] =
    useState([]);
  const [premierLeagueMatches, setPremierLeagueMatches] = useState([]);

  const today = new Date();
  const apiFormatDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apiFormatNextDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(apiFormatDate);
  const [selectedNextDate, setSelectedNextDate] = useState(apiFormatNextDate);
  

  const handleDateSelect = (date,nextDate) => {
    setSelectedDate(date);
    setSelectedNextDate(nextDate);// Ustawienie wybranej daty\
   
  };
  useEffect(() => {
    if (!selectedDate) return; // Nie rób nic, jeśli data nie została wybrana

    
    const fetchData = async () => {
      const response = await fetch(
        `https://wcmmhh-3000.csb.app/matches?dateFrom=${selectedDate}&dateTo=${selectedNextDate}`
      );
      const result = await response.json();
      setData(result);
      // Filter the necessary data here

      setClMatches(findMatches(result, "UEFA Champions League"));
      setChampionshipmatches(findMatches(result, "Championship"));
      setBundesligaMatches(findMatches(result, "Bundesliga"));
      setEredivisieMatches(findMatches(result, "Eredivisie"));
      setPrimeraDivisionMatches(findMatches(result, "Primera Division"));
      setLigue1Matches(findMatches(result, "Ligue 1"));
      setPrimeiraLigaMatches(findMatches(result, "Primeira Liga"));
      setEuropeanChampionshipMatches(
        findMatches(result, "European Championship")
      );
      setPremierLeagueMatches(findMatches(result, "Premier League"));
      setSerieABrazilMatches(
        findMatches(result, "Campeonato Brasileiro Série A")
      );
      setSerieAItalyMatches(findMatches(result, "Serie A"));
    };

    // Call the fetch function
    fetchData();
  }, [selectedDate]); // Empty dependency array to ensure it runs once when component mounts

  console.log(championsLeagueMatches);
  console.log(data);

  return (
    <>
      <DateSlider onDateSelect={handleDateSelect} />
      {championsLeagueMatches.length > 0 && (
        <CardBoxForMatches matches={championsLeagueMatches}></CardBoxForMatches>
      )}
      {championshipMatches.length > 0 && (
        <CardBoxForMatches matches={championshipMatches}></CardBoxForMatches>
      )}
      {serieABrazilMatches.length > 0 && (
        <CardBoxForMatches matches={serieABrazilMatches}></CardBoxForMatches>
      )}
      {serieAItalyMatches.length > 0 && (
        <CardBoxForMatches matches={serieAItalyMatches}></CardBoxForMatches>
      )}
      {bundesligaMatches.length > 0 && (
        <CardBoxForMatches matches={bundesligaMatches}></CardBoxForMatches>
      )}
      {eredivisieMatches.length > 0 && (
        <CardBoxForMatches matches={eredivisieMatches}></CardBoxForMatches>
      )}
      {primeraDivisionMatches.length > 0 && (
        <CardBoxForMatches matches={primeraDivisionMatches}></CardBoxForMatches>
      )}
      {ligue1Matches.length > 0 && (
        <CardBoxForMatches matches={ligue1Matches}></CardBoxForMatches>
      )}
      {primeiraLigaMatches.length > 0 && (
        <CardBoxForMatches matches={primeiraLigaMatches}></CardBoxForMatches>
      )}
      {europeanChampionshipMatches.length > 0 && (
        <CardBoxForMatches
          matches={europeanChampionshipMatches}
        ></CardBoxForMatches>
      )}
      {premierLeagueMatches.length > 0 && (
        <CardBoxForMatches matches={premierLeagueMatches}></CardBoxForMatches>
      )}
    </>
  );
}

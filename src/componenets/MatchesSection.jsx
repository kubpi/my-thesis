import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";

export function MatchesSection() {
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Define an async function to fetch data
    const fetchData = async () => {
      const response = await fetch(
        "https://wcmmhh-3000.csb.app/matches?dateFrom=2023-10-25&dateTo=2023-10-26"
      );
      const result = await response.json();
      setData(result);
      // Filter the necessary data here
      const championsLeagueMatches = result.matches.filter(
        (match) => match.competition.name === "UEFA Champions League"
      );

      setFilteredMatches(championsLeagueMatches);
    };

    // Call the fetch function
    fetchData();
  }, []); // Empty dependency array to ensure it runs once when component mounts

  console.log(filteredMatches);
  console.log(data);

  return (
    <>
      <CardBoxForMatches clMatches = {filteredMatches}></CardBoxForMatches>
      <CardBoxForMatches></CardBoxForMatches>
      <CardBoxForMatches></CardBoxForMatches>
      <CardBoxForMatches></CardBoxForMatches>
      <CardBoxForMatches></CardBoxForMatches>
    </>
  );
}

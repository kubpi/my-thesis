// MatchesDataProvider.js
import { createContext, useState, useContext, useEffect } from 'react';
import { fetchAllMatchesLive, tournamentIds, tournaments,addMatchesTotempAllMatchesData, divideMatchesToLeagues, getAllMatchesDays, filterMatchesByDate,getDaysWithoutMatches } from '../Services/apiService';

const MatchesDataContext = createContext();

export const useMatchesData = () => useContext(MatchesDataContext);

export const MatchesDataProvider = ({ children }) => {
    const [allMatchesData, setAllMatchesData] = useState({});
    const [liveMatches, setLiveMatchesData] = useState({});
    const [daysWithNoMatches, setDaysWithNoMatches] = useState([]);
 

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
            setLiveMatchesData(liveMatches.events); // Zakładam, że odpowiedź zawiera pole 'events'
        });
        
        const fetchMatches = async () => {
            const nextMatchesPromises = divideMatchesToLeagues("next");
            const lastMatchesPromises = divideMatchesToLeagues("last");
      
            console.log(lastMatchesPromises);
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

       
        const value = {
            allMatchesData,
            setAllMatchesData,
            liveMatches,
            daysWithNoMatches,
        
        };
  
        return (
            <MatchesDataContext.Provider value={value}>
                {children}
            </MatchesDataContext.Provider>
        );
    
}

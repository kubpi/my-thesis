import { CardBoxForMatches } from "./CardBoxForMatches";
import { useState, useEffect } from "react";
import { DateSlider } from "./DateSlider";
import "./Matches.css";
import { validate } from "react-native-web/dist/cjs/exports/StyleSheet/validate";
import { matches } from "lodash";

const tournaments = [
  { id: 202, name: "Ekstraklasa", season: 52176 },
  { id: 8, name: "LaLiga", season: 52376 },
  { id: 7, name: "ChampionsLeague", season: 52162 },
  { id: 17, name: "PremierLeague", season: 52186 },
  { id: 35, name: "Bundesliga", season: 52608 },
  { id: 23, name: "SerieA", season: 52760 },
  { id: 679, name: "UEFAEuropaLeague", season: 53654 },
  { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
  //{ id: 325, name: "BrasileiroSerieA", season: 48982 },
  { id: 242, name: "MLS", season: 47955 },
  //{ id: 13475, name: "CopadelaLigaProfesional", season: 13475 },
  //{ id: 649, name: "CFASuperLeague", season: 49950 },
  //{ id: 682, name: "PremierLeagueKaz", season: 48738 },
  //{ id: 544, name: "SegundaFederación", season: 53413 },
  { id: 34, name: "Ligue1", season: 52571 },
  { id: 37, name: "Eredivisie", season: 52554 },
  { id: 808, name: "PremierLeagueEG", season: 55005 },
  { id: 955, name: "SaudiProfessionalLeague", season: 53241 },
  { id: 281, name: "PucharPolski", season: 52567 },
  { id: 329, name: "CopadelRey", season: 55373 },
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
  const [liveMatches, setLiveMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  
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
    let lastMatches = {};
    const fetchLastMatches = async (tournament) => {
      const response = await fetch(`https://66rlxf-3000.csb.app/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/team-events/total`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    };
  
    const fetchLastAllMatches = async () => {
      try {
        const allPromises = tournaments.map(tournament => fetchLastMatches(tournament));
  
        const results = await Promise.all(allPromises);
  

  
        results.forEach((result, index) => {
          const tournamentName = tournaments[index].name;
          const tournamentEvents = result.tournamentTeamEvents;
          if (tournamentEvents) {
            const matches = Object.values(tournamentEvents).flatMap(matchDayArray => 
              Object.values(matchDayArray).flatMap(match => match)
            );
            lastMatches[tournamentName] = matches;
          }
        });
     

        //console.log(tempAllMatchesData);
      } catch (error) {
        console.error('An error occurred while fetching the tournament data:', error);
      }
    };
  
  
// const fetchMatchesLastPage = async (
    //   tournament,
    //   pageNumber = 0,
    //   accumulatedMatches = []
    // ) => {
    //   const response = await fetch(
    //     `https://66rlxf-3000.csb.app/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/events/last/${pageNumber}`
    //   );

    //   // Jeśli mamy status 404, zakończ rekursję i zwróć zebrane do tej pory mecze
    //   // if (response.status === 404) {
    //   //   return accumulatedMatches;
    //   // }
      
    //   try {
    //     const data = await response.json();
    //     if (data.error && data.error.code === 404) {
    //       return accumulatedMatches;
    //     }
    //     //console.log(data);  // after response.json() in fetchMatchesPage

    //     if (!data || data.length === 0 || pageNumber >= 10) {
    //       return accumulatedMatches;
    //     }

    //     return await fetchMatchesLastPage(
    //       tournament,
    //       pageNumber + 1,
    //       accumulatedMatches.concat(data)
    //     );
    //   } catch (error) {
    //     console.error(
    //       "Error fetching page",
    //       pageNumber,
    //       "for",
    //       tournament.name,
    //       ":",
    //       error
    //     );
    //     return accumulatedMatches;
    //   }
    // };

 
    // const fetchLastMatches = async () => {
    //   // Mapujemy tablicę turniejów na tablicę obietnic
    //   const allPromises = tournaments.map((tournament) => 
    //     fetchMatchesLastPage(tournament)
    //   );
    
    //   // Czekamy na rozwiązanie wszystkich obietnic w tablicy
    //   const allMatches = await Promise.all(allPromises);
    
    //   // Teraz 'allMatches' jest tablicą wyników z każdej obietnicy
    //   const tournamentsWithMatches = tournaments.map((tournament, index) => ({
    //     ...tournament,
    //     matches: allMatches[index]
    //   }));
    
    //   // Teraz możemy zobaczyć pełne wyniki
    //   console.log("dupa")
    //   console.log(tournamentsWithMatches);
    // };
    // fetchLastMatches();


    const tournamentIds = tournaments.map(t => t.id);
    let updatedAllMatchesData = {};  // Deklaracja poza zakresem funkcji fetchAllMatchesLive
    
    const fetchAllMatchesLive = async () => {
      const response = await fetch('https://66rlxf-3000.csb.app/api/v1/sport/football/events/live');
      if (response.status === 404) {
        console.error("Błąd serwera");
        return;
      }
      try {
        const data = await response.json();
       
        const filteredLiveMatches = data.events.filter(event =>
          tournamentIds.includes(event?.tournament?.uniqueTournament?.id)
        );
   
        // Aktualizacja tempAllMatchesData z nowymi meczami na żywo
        updatedAllMatchesData = { ...allMatchesData };
        filteredLiveMatches.forEach(liveMatch => {
          const tournamentName = tournaments.find(t => t.id === liveMatch.tournament.uniqueTournament.id).name;
          if (!updatedAllMatchesData[tournamentName]) {
            updatedAllMatchesData[tournamentName] = [];
          }
          // Sprawdzanie, czy mecz już istnieje w updatedAllMatchesData
          if (!updatedAllMatchesData[tournamentName].some(match => match.id === liveMatch.id)) {
            updatedAllMatchesData[tournamentName].unshift(liveMatch);
          }
        });
        

       // console.log(updatedAllMatchesData)
        setLiveMatches(data.events); // Zakładam, że odpowiedź zawiera pole 'events'
      } catch (error) {
        console.error("Error fetching", error);
      }
    }
    


    if (!selectedDate) return;


    
    

    const fetchMatchesPage = async (
      tournament,
      pageNumber = 0,
      accumulatedMatches = []
    ) => {
      const response = await fetch(
        `https://66rlxf-3000.csb.app/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/events/next/${pageNumber}`
      );

      // Jeśli mamy status 404, zakończ rekursję i zwróć zebrane do tej pory mecze
      // if (response.status === 404) {
      //   return accumulatedMatches;
      // }
      
      try {
        const data = await response.json();
        if (data.error && data.error.code === 404) {
          return accumulatedMatches;
      }
        //console.log(data);  // after response.json() in fetchMatchesPage

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
            
// Połączenie updatedAllMatchesData z tempAllMatchesData
Object.keys(updatedAllMatchesData).forEach(key => {
  if (tempAllMatchesData[key]) {
    // Dodawanie tylko tych meczów, które jeszcze nie istnieją w tempAllMatchesData
    updatedAllMatchesData[key].forEach(liveMatch => {
      if (!tempAllMatchesData[key].some(match => match.id === liveMatch.id)) {
        tempAllMatchesData[key].unshift(liveMatch);
      }
    });
  } else {
    tempAllMatchesData[key] = updatedAllMatchesData[key];
  }
});

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


      
       
        
          fetchLastAllMatches()
            Object.keys(lastMatches).forEach(tournamentName => {
              const newMatches = lastMatches[tournamentName];
            
              //console.log(newMatches);
            
              newMatches.forEach(matches => {
                if (!tempAllMatchesData[tournamentName].some(match => match.id === matches.id)) {
                  tempAllMatchesData[tournamentName].push(matches)
                }
                
                
               })
   
              // tempAllMatchesData[tournamentName].push(newMatches[0])
            })
          
         
        
        
       
          console.log(tempAllMatchesData)
          setAllMatchesData(tempAllMatchesData);
          setDaysWithNoMatches(daysWithoutMatches);
          const filteredMatches = filterMatchesByDate(tempAllMatchesData, selectedDate);
          setMatchesData(filteredMatches);
        })
        .catch((error) => console.error("Error fetching matches data:", error));
    };
    fetchAllMatchesLive();
    fetchLastAllMatches();
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
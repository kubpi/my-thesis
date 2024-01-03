const BASE_URL = "https://66rlxf-3000.csb.app/api/v1/";
const SOFASCORE_URL = "https://api.sofascore.app/api/v1/";

// export const tournaments = [
//     { id: 202, name: "Ekstraklasa", season: 52176 },
//     { id: 8, name: "LaLiga", season: 52376 },
//     { id: 7, name: "ChampionsLeague", season: 52162 },
//     { id: 17, name: "PremierLeague", season: 52186 },
//     { id: 35, name: "Bundesliga", season: 52608 },
//     { id: 23, name: "SerieA", season: 52760 },
//     { id: 679, name: "UEFAEuropaLeague", season: 53654 },
//     { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
//     //{ id: 325, name: "BrasileiroSerieA", season: 48982 },
//     { id: 242, name: "MLS", season: 47955 },
//     //{ id: 13475, name: "CopadelaLigaProfesional", season: 13475 },
//     //{ id: 649, name: "CFASuperLeague", season: 49950 },
//     //{ id: 682, name: "PremierLeagueKaz", season: 48738 },
//     //{ id: 544, name: "SegundaFederación", season: 53413 },
//     { id: 34, name: "Ligue1", season: 52571 },
//     { id: 37, name: "Eredivisie", season: 52554 },
//     { id: 808, name: "PremierLeagueEG", season: 55005 },
//     { id: 955, name: "SaudiProfessionalLeague", season: 53241 },
//     { id: 281, name: "PucharPolski", season: 52567 },
//     { id: 329, name: "CopadelRey", season: 55373 },
// ];

export const tournaments = [
  { id: 8, name: "laLiga", season: 52376 },
  { id: 17, name: "premierLeague", season: 52186 },
  { id: 23, name: "serieA", season: 52760 },
  { id: 915, name: "persianGulfProLeague", season: 52957 },
  { id: 202, name: "ekstraklasa", season: 52176 },
];

// export const tournaments = [
//   { id: 202, name: "Ekstraklasa", season: 52176 },
//   { id: 8, name: "LaLiga", season: 52376 },
//   { id: 7, name: "ChampionsLeague", season: 52162 },
//   { id: 17, name: "PremierLeague", season: 52186 },
//   { id: 35, name: "Bundesliga", season: 52608 },
//   { id: 23, name: "SerieA", season: 52760 },
//   { id: 679, name: "UEFAEuropaLeague", season: 53654 },
//   { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
//   { id: 34, name: "Ligue1", season: 52571 },
//   { id: 37, name: "Eredivisie", season: 52554 },
//   { id: 281, name: "PucharPolski", season: 52567 },
//   { id: 281, name: "PucharPolski", season: 52567 },
//   { id: 27, name: "EuropeanChampionshipQualification", season: 46599 },
//   { id: 54, name: "LaLiga2", season: 52563 },
// ];

export const tournamentIds = tournaments.map((t) => t.id);

export const fetchMatchesPage = async (
  tournament,
  time,
  pageNumber = 0,
  accumulatedMatches = []
) => {
  const response = await fetch(
    `${BASE_URL}unique-tournament/${tournament.id}/season/${tournament.season}/events/${time}/${pageNumber}`
  );

  try {
    const data = await response.json();
    if (data.error && data.error.code === 404) {
      return accumulatedMatches;
    }

    if (!data || data.length === 0 || pageNumber >= 10) {
      return accumulatedMatches;
    }

    return await fetchMatchesPage(
      tournament,
      time,
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

export const getTurnamentImgURL = function (turnamentName) {
  const turnamentObj = tournaments.find(
    (turnament) => turnament.name === turnamentName
  );
  if (!turnamentObj) return null;
  return `${SOFASCORE_URL}unique-tournament/${turnamentObj.id}/image/light`;
};

export const getTurnamentImgURLbyId = function (id) {
  return `${SOFASCORE_URL}unique-tournament/${id}/image/light`;
};
export function ReturnTeamImage(teamId) {
  const baseUrl = "https://api.sofascore.app/api/v1/team";
  const url = `${baseUrl}/${teamId}/image`;
  return url;
}
export const fetchAllMatchesLive = async () => {
  const response = await fetch(`${BASE_URL}sport/football/events/live`);
  if (response.status === 404) {
    console.error("Błąd serwera");
    return;
  }
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching", error);
  }
};

export const divideMatchesToLeagues = (lastOrNextMatches) =>
  tournaments.map(async (tournament) => {
    const matches = await fetchMatchesPage(tournament, lastOrNextMatches);
    return { ...tournament, matches };
  });

export const addMatchesTotempAllMatchesData = function (
  tempAllMatchesData,
  arr,
  pushOrUnshift
) {
  Object.keys(arr).forEach((key) => {
    if (tempAllMatchesData[key]) {
      // Dodawanie tylko tych meczów, które jeszcze nie istnieją w tempAllMatchesData
      arr[key].forEach((liveMatch) => {
        if (
          !tempAllMatchesData[key].some((match) => match.id === liveMatch.id)
        ) {
          if (pushOrUnshift === "push") tempAllMatchesData[key].push(liveMatch);
          else tempAllMatchesData[key].unshift(liveMatch);
        }
      });
    } else {
      tempAllMatchesData[key] = arr[key];
    }
  });
  return tempAllMatchesData;
};

export const getAllMatchesDays = function (obj, arrayToSaveDates) {
  obj.forEach((match) => {
    const matchDate = new Date(match.startTimestamp * 1000);
    const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
      matchDate.getMonth() + 1
    ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
    arrayToSaveDates.push(apiFormatMatchDate);
  });
  console.log(arrayToSaveDates);
  return arrayToSaveDates;
};

export const getDaysWithoutMatches = function (allMatchesDates) {
  const today = new Date();
  const uniqueMatchDates = [...new Set(allMatchesDates)];
  const daysWithoutMatches = Array.from({ length: 218 + 120 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 30 - 90 + index);
    const apiFormatDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return uniqueMatchDates.includes(apiFormatDate) ? null : apiFormatDate;
  }).filter(Boolean);
  return daysWithoutMatches;
};

export const filterMatchesByDate = (allData, date) => {
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

export const filterMatchesByDate2 = (allData, date) => {
  const newMatchesData = {};
  console.log("matchesdata2.........");
  console.log(allData);
  Object.keys(allData).forEach((match) => {
    const matchDate = new Date(match.startTimestamp * 1000);
    const apiFormatMatchDate = `${matchDate.getFullYear()}-${String(
      matchDate.getMonth() + 1
    ).padStart(2, "0")}-${String(matchDate.getDate()).padStart(2, "0")}`;
    return apiFormatMatchDate === date;
  });

  return newMatchesData;
};

export const sendMatches = async (matches, endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matches }), // Zserializuj tablicę meczów do formatu JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Odpowiedź z serwera:", data);
    return data;
  } catch (error) {
    console.error("Błąd podczas wysyłania meczów:", error);
    throw error;
  }
};

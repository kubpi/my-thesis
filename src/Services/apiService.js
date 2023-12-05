const BASE_URL = "https://66rlxf-3000.csb.app/api/v1/";
const SOFASCORE_URL = "https://api.sofascore.app/api/v1/";

// export const tournaments2 = [
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
//   ];

export const tournaments = [
  { id: 202, name: "Ekstraklasa", season: 52176 },
  { id: 8, name: "LaLiga", season: 52376 },
  { id: 7, name: "ChampionsLeague", season: 52162 },
  { id: 17, name: "PremierLeague", season: 52186 },
  { id: 35, name: "Bundesliga", season: 52608 },
  { id: 23, name: "SerieA", season: 52760 },
  { id: 679, name: "UEFAEuropaLeague", season: 53654 },
  { id: 17015, name: "UEFAEuropaConferenceLeague", season: 52327 },
  { id: 34, name: "Ligue1", season: 52571 },
  { id: 37, name: "Eredivisie", season: 52554 },
  { id: 281, name: "PucharPolski", season: 52567 },
  { id: 27, name: "EuropeanChampionshipQualification", season: 46599 },
  { id: 54, name: "LaLiga2", season: 52563 },
];

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

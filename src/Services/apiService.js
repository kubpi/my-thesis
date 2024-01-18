export const tournaments = [
  { id: 8, name: "laLiga", season: 52376 },
  { id: 17, name: "premierLeague", season: 52186 },
  { id: 23, name: "serieA", season: 52760 },
  { id: 915, name: "persianGulfProLeague", season: 52957 },
  { id: 202, name: "ekstraklasa", season: 52176 },
];

export const tournamentIds = tournaments.map((t) => t.id);
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

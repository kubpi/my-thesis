import React from "react";

import './CustomTable2.css';

export default function MatchesTable2() {
  const users = [
    {
      id: 1, // Ensure that there's a unique id for each user
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      score: "2:1",
      date: "22.06.2022",
      status: "Zakończony",
    },{
      id: 1, // Ensure that there's a unique id for each user
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      score: "2:1",
      date: "22.06.2022",
      status: "Zakończony",
    },
    {
      id: 1, // Ensure that there's a unique id for each user
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      score: "2:1",
      date: "22.06.2022",
      status: "Zakończony",
    },
    {
      id: 1, // Ensure that there's a unique id for each user
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      score: "2:1",
      date: "22.06.2022",
      status: "Zakończony",
    },
    // ... other user objects
  ];

// Function to handle checkbox change
const handleCheckboxChange = (userId) => {
  // Handle the change event, like updating the state or making an API call
  console.log(`Checkbox for user id ${userId} changed`);
};

return (
  <table className="match-results-table">
    <thead>
      <tr>
        <th></th> {/* Empty header for checkboxes */}
        <th>Liga</th>
        <th>Drużyna Gospodarzy</th>
        <th>Drużyna Gości</th>
        <th>Wynik</th>
        <th>Data</th>
        <th>Status Meczu</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user, index) => (
        <tr key={user.id}>
          <td>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange(user.id)}
            />
          </td>
          <td>{user.league}</td>
          <td>{user.homeTeamName}</td>
          <td>{user.awayTeamName}</td>
          <td>{user.score}</td>
          <td>{user.date}</td>
          <td>{user.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
}

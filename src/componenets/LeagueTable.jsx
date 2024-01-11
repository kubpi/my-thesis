import React from "react";
import "../css/League.css";

export function LeagueTable() {
  const teams = [
    // Przykładowe dane drużyn
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    { name: "Jagiellonia", played: 12, diff: "+12", points: 26 },
    // ... dodaj pozostałe drużyny
  ];

  return (
    <table className="matches-table ">
      <thead>
        <tr>
          <th>#</th>
          <th>Drużyna</th>
          <th>Rozegrane</th>
          <th>Różnica</th>
          <th>Punkty</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{team.name}</td>
            <td>{team.played}</td>
            <td>{team.diff}</td>
            <td>{team.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

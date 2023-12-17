import React from "react";
import { Table } from "react-bootstrap";
import './CustomTable.css';

export default function MatchesTable() {
  const users = [
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
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th><input type="checkbox" /></th> {/* Header checkbox */}
            <th>Liga</th>
            <th>Drużyna gospodarzy</th>
            <th>Drużyna gości</th>
            <th>Wynik</th>
            <th>Data</th>
            <th>Status meczu</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <input 
                  type="checkbox" 
                  onChange={() => handleCheckboxChange(user.id)} 
                  // Checked state can be controlled here based on component state
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
      </Table>
    </>
  );
}

import React, { useState } from "react";
import './CustomTable3.css';

export default function MatchesTable3(props) {
  const { matches } = props;
  console.log(matches)
  const users = [
    {
      id: 1,
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      homeTeamScore: 2,
      awayTeamScore: 1,
      date: "22.06.2022",
      status: "Zakończony",
    },
    {
      id: 2,
      league: "La liga",
      homeTeamName: "Real Madryt",
      awayTeamName: "FC Barcelona",
      homeTeamScore: 2,
      awayTeamScore: 1,
      date: "22.06.2022",
      status: "Zakończony",
    },
    // ... other user objects with unique ids
  ];

  const [checkedState, setCheckedState] = useState(new Array(users.length).fill(false));

  const handleCheckboxChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  };

  return (
    <div className="users-table">
      <div className="users-table-header">
         <div className="header-item select-column">
              <input
                type="checkbox"
               
              />
     
        </div>
        <div className="header-item">Liga</div>
        <div className="header-item">Gospodarze <div>Goście</div></div>
        <div className="header-item">Wynik</div>
        <div className="header-item">Data</div>
        <div className="header-item">Status</div>
      </div>
      <div className="users-table-body">
        {users.map((user, index) => (

          <div className="table-row " key={user.id}>
            <div className="row-item select-column">
              <input
                type="checkbox"
                id={`custom-checkbox-${user.id}`}
                name={user.name}
                value={user.name}
                checked={checkedState[index]}
                onChange={() => handleCheckboxChange(index)}
              />
            </div>
            <div className="row-item">{user.league}</div>
            <div className="row-item"><div>{user.homeTeamName}</div>{user.awayTeamName}</div>
            <div className="row-item"><div>{user.homeTeamScore}</div>{user.awayTeamScore}</div>
            <div className="row-item">{user.date}</div>
            <div className="row-item">{user.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

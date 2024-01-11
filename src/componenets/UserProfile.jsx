import { useState } from "react";
import "../css/Account.css";
import { Navbar } from "./Nabar";
export function UserProfile() {
  // Mock data for repositories
  const repositories = [
    { id: 1, name: "Mecze ulubione" },
    { id: 2, name: "Mecze obstawione" },
    { id: 3, name: "Znajomi" },
    { id: 3, name: "Ranking" },
    // ... more repositories
  ];

  // const repositories = [
  //     { id: 1, name: 'Mecze ulubione', language: 'TypeScript', isPublic: true,  forkedFrom: 'Zarządzaj swoimi ulubionymi meczemi' },
  //     { id: 2, name: 'Mecze obstawione', language: 'Java', isPublic: true, forkedFrom: 'Burakmeister/Projekt-Store' },
  //     { id: 3, name: 'Znajomi', language: 'JavaScript', isPublic: true },
  //     { id: 3, name: 'Ranking', language: 'JavaScript', isPublic: true },
  //     // ... more repositories
  //   ];

  return (
    <>
      <div className="profile-page-container">
        <div className="profile-section">
          <img
            src="https://www4.minijuegosgratis.com/v3/games/thumbnails/237101_7_sq.jpg"
            alt="Jakub"
            className="avatar"
          />
          <h1>Jakub</h1>
        </div>
        <div className="repositories-section">
          <div className="repositories-grid">
            {repositories.map((repo) => (
              <div key={repo.id} className="repository-card">
                <div className="repository-content">
                  <h3>{repo.name}</h3>
                  <div className="repository-info">
                    <span>{repo.language}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

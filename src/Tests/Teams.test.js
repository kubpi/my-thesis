// // import React from 'react';
// // import { render, screen } from '@testing-library/react';

// // import { Teams } from '../componenets/MatchesData/Teams';
// // const firebaseConfig = {
// //     apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
// //     authDomain: "inzynierka-e7180.firebaseapp.com",
// //     databaseURL:
// //       "https://inzynierka-e7180-default-rtdb.europe-west1.firebasedatabase.app",
// //     projectId: "inzynierka-e7180",
// //     storageBucket: "inzynierka-e7180.appspot.com",
// //     messagingSenderId: "932466898301",
// //     appId: "1:932466898301:web:9700bdf9cae9ba07a00814",
// //   };
// // describe('Teams Component', () => {
// //     jest.mock('firebase/app', () => {
// //         return {
// //           initializeApp: jest.fn(),
// //           // ... inne potrzebne mocki
// //         };
// //       });
// //   const mockProps = {
// //     homeTeam: { name: 'Barcelona', id: 'barcelona' },
// //     awayTeam: { name: 'Real Madrid', id: 'real-madrid' },
// //     homeScore: { display: 2 },
// //     awayScore: { display: 3 },
// //     startTimestamp: 1624035600, // Example timestamp
// //     // ... other props
// //   };

// // //   it('renders without crashing', () => {
// // //     render(<Teams {...mockProps} />);
// // //     expect(screen.getByText('Barcelona')).toBeInTheDocument();
// // //     expect(screen.getByText('Real Madrid')).toBeInTheDocument();
// // //   });

// // //   it('displays the correct score', () => {
// // //     render(<Teams {...mockProps} />);
// // //     expect(screen.getByText(mockProps.homeScore.display.toString())).toBeInTheDocument();
// // //     expect(screen.getByText(mockProps.awayScore.display.toString())).toBeInTheDocument();
// // //   });

// //   it('shows correct team logos', () => {
// //     render(<Teams {...mockProps} />);
// //     const homeTeamLogo = screen.getByAltText('Barcelona');
// //     const awayTeamLogo = screen.getByAltText('Real Madrid');
// //     expect(homeTeamLogo).toBeInTheDocument();
// //     expect(awayTeamLogo).toBeInTheDocument();
// //   });

// //   // Additional tests can be added here...
// // });

// import "@testing-library/jest-dom";

// import React from "react";
// import { render, screen } from "@testing-library/react";
// import { Teams } from "../componenets/MatchesData/Teams";
// import { initializeApp } from "firebase/app";
// import Podium from "../componenets/Podium";
// import { MatchesSection } from "../componenets/MatchesData/MatchesSection";
// const firebaseConfig = {
//   apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
//   authDomain: "inzynierka-e7180.firebaseapp.com",
//   databaseURL:
//     "https://inzynierka-e7180-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "inzynierka-e7180",
//   storageBucket: "inzynierka-e7180.appspot.com",
//   messagingSenderId: "932466898301",
//   appId: "1:932466898301:web:9700bdf9cae9ba07a00814",
// };

// const app = initializeApp(firebaseConfig);

// // Tworzenie mocków dla Firebase jest już wykonane, więc jeśli nie potrzebujesz loga, możesz je pominąć.
// const fs = require("fs");
// // describe("Teams Component", () => {
// //   const mockProps = {
// //     homeTeam: { name: "Barcelona", id: "barcelona" },
// //     awayTeam: { name: "Real Madrid", id: "real-madrid" },
// //     homeScore: { display: 2 },
// //     awayScore: { display: 3 },
// //     startTimestamp: 1624035600,
// //     // ... inne propsy, jeśli są potrzebne
// //   };

// //   it("displays team names and scores", () => {
// //     render(<Teams {...mockProps} />);

// //     // Oczekiwanie, że nazwy drużyn i wyniki będą w dokumencie
// //     expect(screen.getByText("Barcelona")).toBeInTheDocument();
// //     expect(screen.getByText("Real Madrid")).toBeInTheDocument();
// //     expect(screen.getByText("2")).toBeInTheDocument();
// //     expect(screen.getByText("3")).toBeInTheDocument();

// //     // Jeśli używasz formatowania wyników, np. "2 - 3", upewnij się, że taki tekst istnieje
// //     // expect(screen.getByText('2 - 3')).toBeInTheDocument();
// //   });
// //   it("renders without crashing", () => {
// //     render(<Podium />);
// //   });

// //   // Tutaj dodaj więcej testów zgodnie z potrzebami
// // });

// describe("Global Errors", () => {
//     let errors = [];

//     // Przed każdym testem czyścimy listę błędów
//     beforeEach(() => {
//       errors = [];
//     });

//     it("should capture errors from different components", () => {
//       // Tutaj uruchamiamy testy różnych komponentów i przechwytujemy błędy
//       try {
//         render(<Teams />);
//       } catch (error) {
//         // Tworzymy obiekt z nazwą komponentu i komunikatem błędu
//         const errorInfo = {
//           componentName: "Teams",
//           errorMessage: error.message,
//         };
//         // Dodajemy ten obiekt do listy błędów
//         errors.push(errorInfo);
//       }

//       try {
//         render(<MatchesSection />);
//       } catch (error) {
//         // Podobnie dla innego komponentu
//         const errorInfo = {
//           componentName: "MatchesSection",
//           errorMessage: error.message,
//         };
//         errors.push(errorInfo);
//       }

//       // Możesz kontynuować dla innych komponentów...
//  // Zapisz błędy do pliku
//  const errorsJSON = JSON.stringify(errors, null, 2);
//  fs.writeFileSync("errors.json", errorsJSON);

//  console.log("Captured errors:", errors);
//  console.log("Errors saved to errors.json");
//     });
//   });
import '@testing-library/jest-dom'


import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Teams } from "../componenets/MatchesData/Teams";
const firebaseConfig = {
  apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
  authDomain: "inzynierka-e7180.firebaseapp.com",
  databaseURL:
    "https://inzynierka-e7180-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "inzynierka-e7180",
  storageBucket: "inzynierka-e7180.appspot.com",
  messagingSenderId: "932466898301",
  appId: "1:932466898301:web:9700bdf9cae9ba07a00814",
};
initializeApp(firebaseConfig);
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: jest.fn(() => "teamsLogos/team-id"),
  getDownloadURL: jest.fn(() =>
    Promise.resolve("gs://inzynierka-e7180.appspot.com/teamsLogos/14.png")
  ),
}));

describe("Teams Component", () => {
  it("loads images and calculates load time", async () => {
    const mockProps = {
      homeTeam: { name: "Barcelona", id: "14" },
      awayTeam: { name: "Real Madrid", id: "15" },
      homeScore: { display: 2 },
      awayScore: { display: 3 },
      startTimestamp: 1624035600,
      time: {},
      matchStatus: "",
      matchStatusType: "",
      currentPeriodStartTimestamp: 0,
    };

    const storage = getStorage();
    const homeLogoRef = ref(storage, `teamsLogos/${mockProps.homeTeam.id}.png`);
    const awayLogoRef = ref(storage, `teamsLogos/${mockProps.awayTeam.id}.png`);

    const startLoadTime = performance.now();
    const homeLogoURL = await getDownloadURL(homeLogoRef);
    const awayLogoURL = await getDownloadURL(awayLogoRef);
    const endLoadTime = performance.now();

    // Renderowanie komponentu Teams z rzeczywistymi URL obrazów
    const { getByAltText } = render(<Teams {...mockProps} />);

    // Oczekiwanie na załadowanie obrazów
    await waitFor(() => getByAltText("Barcelona"));
    await waitFor(() => getByAltText("Real Madrid"));

    // Sprawdzenie, czy obrazy mają właściwe atrybuty 'src'
    const homeLogoImg = getByAltText("Barcelona");
    const awayLogoImg = getByAltText("Real Madrid");
    expect(homeLogoImg).toHaveAttribute("src", homeLogoURL);
    expect(awayLogoImg).toHaveAttribute("src", awayLogoURL);

    // Kalkulacja czasu ładowania
    const loadTime = endLoadTime - startLoadTime;
    console.log(`Czas ładowania obrazów: ${loadTime}ms`);
  });
});

import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Account from "./pages/Betting";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";

import { getFirestore } from "firebase/firestore";
import { collection } from "firebase/firestore";

import { onSnapshot } from "firebase/firestore";

import { doc, setDoc, writeBatch } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Podium from "./componenets/Podium";
import FriendsList from "./componenets/FriendsList";
import Betting from "./pages/Betting";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
//   authDomain: "inzynierka-e7180.firebaseapp.com",
//   projectId: "inzynierka-e7180",
//   storageBucket: "inzynierka-e7180.appspot.com",
//   messagingSenderId: "932466898301",
//   appId: "1:932466898301:web:9700bdf9cae9ba07a00814"
// };

// Your web app's Firebase configuration

export default function App() {
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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Get the current user's auth information
  const auth = getAuth();

  const [laLigaMatches, setLaLigaMatches] = useState([]);

  useEffect(() => {
    const fetchMatchesInRange = async (
      tournament,
      startDateStr,
      endDateStr
    ) => {
      const firestore = getFirestore(app);
      const matchesRef = collection(
        firestore,
        `matchesData/${tournament}/matches`
      );

      const startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      const q = query(
        matchesRef,
        where("startTimestamp", ">=", startDate.getTime() / 1000),
        where("startTimestamp", "<=", endDate.getTime() / 1000)
      );

      try {
        const querySnapshot = await getDocs(q);
        const matches = [];
        querySnapshot.forEach((doc) => {
          matches.push(doc.data());
        });
        setLaLigaMatches(matches);
      } catch (error) {
        console.error("Error fetching matches in range:", error);
      }
    };

    fetchMatchesInRange("laLiga", "2023-12-24", "2024-01-07");
  }, []);

  // console.log(laLigaMetches)
  console.log(laLigaMatches);

  const [user, loading, error] = useAuthState(auth);
  return (
    <>
      <div className="App">
        <section>
          <FavoritesProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />}>
                  {" "}
                  /
                </Route>
                <Route path="/betting" element={<Betting />} />
                <Route path="#podium" element={<Podium />} />
                <Route path="/friends" element={<FriendsList />} />
              </Routes>
            </BrowserRouter>
            </FavoritesProvider>
        </section>
      </div>
    </>
  );
}

import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Account from "./pages/Account";
import { FavoritesProvider } from "./componenets/FavoritesContext";
import { MatchesDataProvider } from "./componenets/MatchesDataProvider";
import { useAuthState } from 'react-firebase-hooks/auth';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkSEz109STYK02nQ-Kcij3eqpOMZ31R58",
  authDomain: "inzynierka-e7180.firebaseapp.com",
  projectId: "inzynierka-e7180",
  storageBucket: "inzynierka-e7180.appspot.com",
  messagingSenderId: "932466898301",
  appId: "1:932466898301:web:9700bdf9cae9ba07a00814"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export default function App() {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  return (
    <>
        <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <><Matches />  <AddMatch/></> : <SignIn />}
      </section>

    </div>
      {/* <MatchesDataProvider>
      <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}> /</Route>          
          <Route path="/account" element={<Account />} />
        </Routes>
        </BrowserRouter>
        </FavoritesProvider>
        </MatchesDataProvider> */}
    </>
  );
}

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, query, where, addDoc } from 'firebase/firestore';


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider);
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}



import { signOut } from 'firebase/auth';

function SignOut() {
  const auth = getAuth();

  return auth.currentUser && (
    <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

import React, { useEffect, useState } from 'react';
import {  onSnapshot } from 'firebase/firestore';

function Matches() {
  const [matches, setMatches] = useState([]);
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(collection(firestore, 'matches'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(matchList);
    }, (error) => {
      console.error(error);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  if (!auth.currentUser) {
    return null;
  }

  return (
    <div>
      <h2>Matches</h2>
      {matches.map((match) => (
        <div key={match.id}>
          <p>Team: {match.team} - Score: {match.teamScore}</p>
        </div>
      ))}
    </div>
  );
}



function AddMatch() {
  const auth = getAuth();
  const firestore = getFirestore();
  const matchesRef = collection(firestore, 'matches');

  const addNewMatch = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("User not authenticated");
      return;
    }

    try {
      const docRef = await addDoc(matchesRef, {
        userId: currentUser.uid, // Include the user ID
        team: "Barrcelona",
        teamScore: "1",
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <button onClick={addNewMatch}>Add New Match</button>
  );
}





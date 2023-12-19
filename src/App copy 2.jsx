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
          <SignUp></SignUp>
      </header>

      <section>
        {user ? <> <MatchesDataProvider>
      <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}> /</Route>          
          <Route path="/account" element={<Account />} />
        </Routes>
        </BrowserRouter>
        </FavoritesProvider>
        </MatchesDataProvider>  </> : <SignIn />}
      </section>

    </div>
      
    </>
  );
}

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, query, where, addDoc } from 'firebase/firestore';


import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function SignIn() {
  const auth = getAuth();

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
        // Signed in
        console.log(userCredential);
      })
      .catch((error) => {
        console.error('Error signing in with email and password:', error);
      });
  };

  return (
    <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Sign in with Email</button>
      </form>
    </>
  );
}


 


  function SignUp() {
    const auth = getAuth();
  
    const handleSignUp = (event) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
          // Signed up
          console.log(userCredential);
        })
        .catch((error) => {
          console.error('Error signing up:', error);
        });
    };
  
    return (
      <form onSubmit={handleSignUp}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
    );
  }
  


  




import { signOut } from 'firebase/auth';

function SignOut() {
  const auth = getAuth();

  return auth.currentUser && (
    <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}







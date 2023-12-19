import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Account from "./pages/Account";
import { FavoritesProvider } from "./componenets/FavoritesContext";
import { MatchesDataProvider } from "./componenets/MatchesDataProvider";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';




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
      

      <section>
        <MatchesDataProvider>
      <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}> /</Route>          
          <Route path="/account" element={<Account />} />
        </Routes>
        </BrowserRouter>
        </FavoritesProvider>
        </MatchesDataProvider>
      </section>

    </div>
      
    </>
  );
}









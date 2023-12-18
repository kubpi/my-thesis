import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Account from "./pages/Account";
import { FavoritesProvider } from "./componenets/FavoritesContext";




export default function App() {
  return (
    <>
     
      <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}> /</Route>          
          <Route path="/account" element={<Account />} />
        </Routes>
        </BrowserRouter>
        </FavoritesProvider>
  
    </>
  );
}

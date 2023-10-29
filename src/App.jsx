import "bootstrap/dist/css/bootstrap.css";
import "./css/App.css";
// import { CardBody } from './componenets/CardBody'
import { Navbar } from "./componenets/Nabar";
// import { Navbar } from './componenets/Navbar'
// import { TopNavbar } from './componenets/TopNavbar'
import { HeroSection } from "./componenets/HeroSection";
import { Pblogos } from "./componenets/Pblogos";
import { MatchesSection } from "./componenets/MatchesSection";
import { LeagueTable } from "./componenets/LeagueTable";

export default function App() {
  return (
    <>
      <Navbar></Navbar>
      <HeroSection></HeroSection>
      <Pblogos></Pblogos>
      <MatchesSection></MatchesSection>
      
    </>
  );
}

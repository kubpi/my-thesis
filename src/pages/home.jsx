import { HeroSection } from "../componenets/HeroSection";
import { MatchesSection } from "../componenets/MatchesData/MatchesSection";
import { Navbar } from "../componenets/Nabar";
import { Pblogos } from "../componenets/Pblogos";

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <HeroSection></HeroSection>
      <Pblogos></Pblogos>
      <MatchesSection></MatchesSection>
    </>
  );
}

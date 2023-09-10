
import 'bootstrap/dist/css/bootstrap.css';
import './App.css'
// import { CardBody } from './componenets/CardBody'
import { Navbar2 } from './componenets/Nabar2'
// import { Navbar } from './componenets/Navbar'
// import { TopNavbar } from './componenets/TopNavbar'
import { HeroSection } from './componenets/HeroSection';
import { Pblogos } from './componenets/Pblogos';
import { DateSlider } from './componenets/DateSlider';

export default function App() {
  
  return (
    <>    
      <Navbar2></Navbar2>
      <HeroSection></HeroSection>
      <Pblogos></Pblogos>
      <DateSlider></DateSlider>
    </>
  )
}


import { FavMatches } from "../componenets/FavMatches";
import FavoriteMatches from "../componenets/FavoriteMatches";
import { Navbar } from "../componenets/Nabar";
import Podium from "../componenets/Podium";
import TabsBar from "../componenets/TabsBar";
import { UserProfile } from "../componenets/UserProfile";

export default function Home() {  
  const rankings = [
    { name: 'Alice', points: 150 },
    { name: 'Bob', points: 120 },
    { name: 'Charlie', points: 110 },
    // Additional rankings
    { name: 'Dave', points: 100 },
    { name: 'Eve', points: 90 },
    { name: 'Frank', points: 85 },
    // ... more rankings if needed
  ];
    return (
      <>
            <Navbar></Navbar>
        {/* <UserProfile></UserProfile>  */}
        {/* <Podium rankings={rankings}></Podium> */}
        
        <TabsBar></TabsBar>
        
    
 
      </>
    );
  }
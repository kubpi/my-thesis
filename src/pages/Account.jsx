
import { FavMatches } from "../componenets/FavMatches";
import MatchesTable2 from "../componenets/MatchesTable2";
import MatchesTable from "../componenets/MatchesTable2";
import { Navbar } from "../componenets/Nabar";
import TabsBar from "../componenets/TabsBar";
import { UserProfile } from "../componenets/UserProfile";

export default function Home() {  
    return (
      <>
            <Navbar></Navbar>
        <UserProfile></UserProfile> 
        <TabsBar></TabsBar>
     
 
      </>
    );
  }
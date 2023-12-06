
import { FavMatches } from "../componenets/FavMatches";
import { Navbar } from "../componenets/Nabar";
import { UserProfile } from "../componenets/UserProfile";

export default function Home() {  
    return (
      <>
            <Navbar></Navbar>
            <UserProfile></UserProfile>  
        <FavMatches></FavMatches>    
      </>
    );
  }
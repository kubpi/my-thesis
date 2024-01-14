import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';



export function Navbar() {

  const auth = getAuth();
  const user = auth.currentUser; // If you're using Firebase authentication
  console.log(user)
  function getUsernameFromEmail(email) {
    return email.split('@')[0];
  }
  return (
    <>
      <nav className="navbar navbar-expand-sm "data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            betting-score
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {user &&
            <div className="collapse navbar-collapse -xxl" id="navbarNav">
              <ul className="navbar-nav">
              
                <li className="nav-item">
                  <a className="nav-link" aria-current="page" href="/#matchesSection">
                    mecze
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/betting">
                    obstawianie
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/betting#podium">ranking</a>
                </li>
                {user ? <a className="nav-link" href="/#" onClick={() => signOut(auth)}>wyloguj się</a> : <div></div>}
                {user && <>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      {user?.displayName || getUsernameFromEmail(user?.email)}
                    </a>
                  </li></>}
              </ul>
            
            </div>
          }
        </div>
      </nav>
    </>
  );
}

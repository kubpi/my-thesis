import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';



export function Navbar() {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  
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

          <div className="collapse navbar-collapse -xxl" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="#">
                  mecze
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/ranking">
                  wyniki
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  obstawianie
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/account">
                  Witaj imie
                </a>
              </li>
              {user ?  <a className="nav-link" href="/#" onClick={() => signOut(auth)}>wyloguj się</a> : <div></div>}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

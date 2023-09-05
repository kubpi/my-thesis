export function Navbar2() {
  return (
    <>
      <nav className="navbar navbar-expand-sm "data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
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
                <a className="nav-link" href="#">
                  wyniki
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  obstawianie
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  forum
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

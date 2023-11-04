//import { Buttons } from "./Buttons";
export function HeroSection() {
  return (
    <>
      <div className="container15">
        <div className="row hero-row">
          <div className="col-sm">
            <div className="container1 tekst">
              <div className="row">
                <div className="home-slogan">Wszystko <br></br> o piłce nożnej</div>
              </div>
              <div className="row">
                <div className="home-title">Przegladaj mecze, obstawiaj transfery, baw się ze <br></br> znajomymi w obstawianie.</div>
              </div>
              <div className="row">
              <button type="button"  className="buttonik2">zarejestruj się</button>
                <button type="button"  className="buttonik">zaloguj się</button>
              </div>
            </div>
          </div>
          <div className="col-sm d-flex align-items-center justify-content-left image-column"><img className="img-fluid" src="/src/assets/footballerpicture.png"></img></div>
        </div>
      </div>
    </>
  );
}

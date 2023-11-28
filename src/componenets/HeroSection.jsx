import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "./login.css";
export function HeroSection() {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
  function handleRegisterLink() {
    setLoginModalIsOpen(false);
    setRegisterModalIsOpen(true);
  }

  function handleForgotPassword() {
    // Logic for forgot password
    // Possibly set another modal state for forgot password or redirect
  }
  return (
    <>
      <div className="container15">
        <div className="row hero-row">
          <div className="col-sm">
            <div className="container1 tekst">
              <div className="row">
                <div className="home-slogan">
                  Wszystko <br></br> o piłce nożnej
                </div>
              </div>
              <div className="row">
                <div className="home-title">
                  Przegladaj mecze, obstawiaj transfery, baw się ze <br></br>{" "}
                  znajomymi w obstawianie.
                </div>
              </div>
              <div className="row">
                <button
                  type="button"
                  onClick={() => setLoginModalIsOpen(true)}
                  className="buttonik"
                >
                  zaloguj się
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterModalIsOpen(true)}
                  className="buttonik2"
                >
                  zarejestruj się
                </button>
              </div>
            </div>
          </div>
          <div className="col-sm d-flex align-items-center justify-content-left image-column">
            <img
              className="img-fluid"
              src="/src/assets/footballerpicture.png"
            ></img>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={loginModalIsOpen}
        onRequestClose={() => setLoginModalIsOpen(false)}
        onRegisterClick={handleRegisterLink}
        onForgotPasswordClick={handleForgotPassword}
      />
      <RegisterModal
        isOpen={registerModalIsOpen}
        onRequestClose={() => setRegisterModalIsOpen(false)}
      />
    </>
  );
}

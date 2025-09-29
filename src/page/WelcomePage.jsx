import React from "react";
import { useNavigate } from "react-router";
import "../assets/styles/Welcome.css";

function WelcomePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };
  return (
    <>
      <div className="welcomePage-container">
        <div className="welcomePage-content">
          <div className="welcomePage-header">
            <div className="welcome-navbar">
              <img src="/src/assets/images/logo.png" alt="Logo" />
              <div className="welcome-navbar-links">
                <a href="#" className="active">
                  Home
                </a>
                <a href="#">About</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div className="welcome-btns">
              <button className="welcome-login-btn" onClick={handleLogin}>
                Login
              </button>
              <button className="welcome-register-btn" onClick={handleRegister}>
                Register
              </button>
            </div>
          </div>
        </div>
        <div>ádasdadsasdasda</div>
      </div>
    </>
  );
}

export default WelcomePage;

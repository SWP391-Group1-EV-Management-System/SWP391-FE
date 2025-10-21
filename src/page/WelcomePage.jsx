import React from "react";
import { Link, useNavigate } from "react-router";
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
          <div id="welcome-header">
            <div className="welcomePage-header">
              <div className="welcome-header-btn">
                <Link to="/login" className="welcome-login-btn">Login</Link>
                <Link to="/register" className="welcome-register-btn">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;

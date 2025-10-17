import React from "react";
import { Link } from "react-router";

function WelcomePageHeader() {
  return (
    <>
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
         <div className="welcome-header-btn">
          <Link to="/login" className="welcome-login-btn">Login</Link>
          <Link to="/register" className="welcome-register-btn">Register</Link>
        </div>
      </div>
     
    </>
  );
}

export default WelcomePageHeader;

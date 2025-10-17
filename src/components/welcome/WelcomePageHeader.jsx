import React from "react";

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
      </div>
    </>
  );
}

export default WelcomePageHeader;

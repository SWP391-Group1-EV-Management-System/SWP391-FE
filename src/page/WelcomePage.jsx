import React from "react";
import { useNavigate } from "react-router";
import "../assets/styles/Welcome.css";
import WelcomePageBody from "../components/welcome/WelcomePageBody";
import WelcomePageHeader from "../components/welcome/WelcomePageHeader";

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
            <WelcomePageHeader />
          </div>
          <div id="welcome-body">
            <WelcomePageBody />
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;

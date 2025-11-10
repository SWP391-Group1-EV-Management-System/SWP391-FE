import React from "react";
import { Link } from "react-router";
import "../assets/styles/Welcome.css";

function WelcomePage() {

  return (
    <>
      <div className="welcomePage-container">
        <div className="welcomePage-content">
          <div id="welcome-header">
            <div className="welcomePage-header">
              <div className="welcome-header-btn">
                <Link to="/login" className="welcome-login-btn">ĐĂNG NHẬP</Link>
                <Link to="/register" className="welcome-register-btn">ĐĂNG KÝ</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Menu from "./Menu.jsx";
import MyNavbar from "./MyNavbar.jsx";
import "../../assets/styles/MainContent.css";

function Layout() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to get responsive marginLeft
  const getMarginLeft = () => {
    if (windowWidth <= 480) {
      // Mobile nhỏ
      return isMenuCollapsed ? "60px" : "160px";
    } else if (windowWidth <= 768) {
      // Mobile lớn/Tablet nhỏ
      return isMenuCollapsed ? "70px" : "137px";
    } else if (windowWidth <= 1024) {
      // Tablet
      return isMenuCollapsed ? "70px" : "200px";
    } else {
      // Desktop
      return isMenuCollapsed ? "70px" : "220px";
    }
  };

  return (
    <div className="app-layout">
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu collapsed={isMenuCollapsed} onToggleCollapse={setIsMenuCollapsed} />
      <main
        className={`main-content ${isMenuCollapsed ? "menu-collapsed" : ""}`}
        style={{
          marginLeft: getMarginLeft(),
          padding: "60px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 60px)",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;

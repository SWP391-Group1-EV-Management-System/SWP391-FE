import React, { useState } from "react";
import { Outlet } from "react-router";
import Menu from "./Menu.jsx";
import MyNavbar from "./MyNavbar.jsx";
import "../../assets/styles/MainContent.css";

function Layout() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu collapsed={isMenuCollapsed} onToggleCollapse={setIsMenuCollapsed} />
      <main
        className={`main-content ${isMenuCollapsed ? "menu-collapsed" : ""}`}
        style={{
          marginLeft: isMenuCollapsed ? "80px" : "250px",
          padding: "20px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "#f5f5f5",
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

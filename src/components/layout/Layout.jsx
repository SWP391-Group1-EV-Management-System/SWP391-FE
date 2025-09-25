import React, { useState } from "react";
import { Outlet } from "react-router";
import Menu from "./Menu.jsx";
import MyNavbar from "./MyNavbar.jsx";
import "../../assets/styles/MainContent.css";

function Layout() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <>
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu collapsed={isMenuCollapsed} onToggleCollapse={setIsMenuCollapsed} />
      <main
        className={`main-content ${isMenuCollapsed ? "menu-collapsed" : ""}`}
        style={{
          marginLeft: isMenuCollapsed ? "80px" : "250px",
          padding: "20px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Outlet />
      </main>
    </>
  );
}

export default Layout;

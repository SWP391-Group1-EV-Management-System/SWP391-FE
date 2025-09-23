import React, { useState } from "react";
import Menu from "./components/layout/Menu.jsx";
import MyNavbar from "./components/layout/MyNavbar.jsx";
import ShowCharging from "./components/layout/ShowCharging.jsx";

function App() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  return (
    <>
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu
        collapsed={isMenuCollapsed}
        onToggleCollapse={setIsMenuCollapsed}
      />
      <div style={{ marginLeft: isMenuCollapsed ? "80px" : "250px", padding: "20px" }}>
        <ShowCharging />
      </div>
    </>
  );
}

export default App;

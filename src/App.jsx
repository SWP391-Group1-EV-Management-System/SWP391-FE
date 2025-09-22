import React, { useState } from "react";
import Menu from "./components/layout/Menu.jsx";
import MyNavbar from "./components/layout/MyNavbar.jsx";

function App() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  return (
    <>
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu
        collapsed={isMenuCollapsed}
        onToggleCollapse={setIsMenuCollapsed}
      />{" "}
    </>
  );
}

export default App;

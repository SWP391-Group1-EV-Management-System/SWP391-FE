import React, { useState } from "react";
import Menu from "./components/layout/Menu.jsx";
import MyNavbar from "./components/layout/MyNavbar.jsx";
import ShowCharging from "./components/layout/ShowCharging.jsx";

function App() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // State quản lý trang hiện tại

  const renderContent = () => {
    switch (currentPage) {
      case "energy": // ID của "Phiên sạc" trong menuItems
        return <ShowCharging />;
      case "home":
        return (
          <div>
            <h1>Trang chủ</h1>
            <p>Chào mừng bạn đến với hệ thống quản lý sạc xe điện</p>
          </div>
        );
      case "map":
        return (
          <div>
            <h1>Bản đồ trạm</h1>
            <p>Tính năng bản đồ trạm sạc</p>
          </div>
        );
      case "history":
        return (
          <div>
            <h1>Lịch sử</h1>
            <p>Lịch sử sạc xe điện</p>
          </div>
        );
      case "payment":
        return (
          <div>
            <h1>Thanh toán</h1>
            <p>Quản lý thanh toán</p>
          </div>
        );
      case "favorite":
        return (
          <div>
            <h1>Gói dịch vụ</h1>
            <p>Các gói dịch vụ</p>
          </div>
        );
      case "setting":
        return (
          <div>
            <h1>Cài đặt</h1>
            <p>Cài đặt hệ thống</p>
          </div>
        );
      default:
        return (
          <div>
            <h1>Trang chủ</h1>
            <p>Chào mừng bạn đến với hệ thống quản lý sạc xe điện</p>
          </div>
        );
    }
  };

  return (
    <>
      <MyNavbar collapsed={isMenuCollapsed} />
      <Menu
        collapsed={isMenuCollapsed}
        onToggleCollapse={setIsMenuCollapsed}
        onPageChange={setCurrentPage} // Truyền function để thay đổi trang
        currentPage={currentPage} // Truyền trang hiện tại
      />
      <div style={{ marginLeft: isMenuCollapsed ? "80px" : "250px", padding: "20px" }}>
        {renderContent()}
      </div>
    </>
  );
}

export default App;

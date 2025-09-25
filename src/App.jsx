import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Menu from "./components/layout/Menu.jsx";
import MyNavbar from "./components/layout/MyNavbar.jsx";
import ShowCharging from "./components/layout/ShowCharging.jsx";

// Tạo các component cho từng trang
const HomePage = () => (
  <div>
    <h1>Trang chủ</h1>
    <p>Chào mừng bạn đến với hệ thống quản lý sạc xe điện</p>
  </div>
);

const MapPage = () => (
  <div>
    <h1>Bản đồ trạm</h1>
    <p>Tính năng bản đồ trạm sạc</p>
  </div>
);

const HistoryPage = () => (
  <div>
    <h1>Lịch sử</h1>
    <p>Lịch sử sạc xe điện</p>
  </div>
);

const PaymentPage = () => (
  <div>
    <h1>Thanh toán</h1>
    <p>Quản lý thanh toán</p>
  </div>
);

const FavoritePage = () => (
  <div>
    <h1>Gói dịch vụ</h1>
    <p>Các gói dịch vụ</p>
  </div>
);

const SettingPage = () => (
  <div>
    <h1>Cài đặt</h1>
    <p>Cài đặt hệ thống</p>
  </div>
);

function App() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <MyNavbar collapsed={isMenuCollapsed} />
        <Menu
          collapsed={isMenuCollapsed}
          onToggleCollapse={setIsMenuCollapsed}
        />
        <div 
          className="main-content"
          style={{ 
            marginLeft: isMenuCollapsed ? "80px" : "250px", 
            padding: "20px",
            minHeight: "100vh"
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/energy" element={<ShowCharging />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/favorite" element={<FavoritePage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

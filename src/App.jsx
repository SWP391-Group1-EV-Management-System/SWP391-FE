import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./page/HomePage.jsx";
import MapPage from "./page/MapPage.jsx";
import EnergyPage from "./page/EnergyPage.jsx";
import HistoryPage from "./page/HistoryPage.jsx";
import PaymentPage from "./page/PaymentPage.jsx";
import FavoritePage from "./page/FavoritePage.jsx";
import SettingPage from "./page/SettingPage.jsx";
import NotFoundPage from "./page/NotFoundPage.jsx";
import Login from "./page/Login.jsx";
import Register from "./page/Register.jsx";
import WelcomePage from "./page/WelcomePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome & Auth Routes */}
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Protected Main App Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="energy" element={<EnergyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="favorite" element={<FavoritePage />} />
          <Route path="setting" element={<SettingPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;

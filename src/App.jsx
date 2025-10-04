import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./page/HomePage.jsx";
import MapPage from "./page/MapPage.jsx";
import EnergyPage from "./page/EnergyPage.jsx";
import HistoryPage from "./page/HistoryPage.jsx";
import PaymentPage from "./page/PaymentPage.jsx";
import ServicePackage from "./page/ServicePackage.jsx";
import SettingPage from "./page/SettingPage.jsx";
import NotFoundPage from "./page/NotFoundPage.jsx";
import Login from "./page/Login.jsx";
import Register from "./page/Register.jsx";
import WelcomePage from "./page/WelcomePage.jsx";
import SessionStaffPage from "./page/SessionStaffPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect to app */}
        <Route path="/" element={<Navigate to="/app/home" replace />} />
        
        {/* Welcome & Auth Routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Main App Routes */}
        <Route path="/app" element={<Layout />}>
          {/* Default route for /app */}
          <Route index element={<Navigate to="home" replace />} />
          
          <Route path="home" element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="energy" element={<EnergyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="servicepackage" element={<ServicePackage />} />
          <Route path="setting" element={<SettingPage />} />
          <Route path="sessionstaff" element={<SessionStaffPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

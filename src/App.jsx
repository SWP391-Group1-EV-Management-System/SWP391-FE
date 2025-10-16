import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./page/HomePage.jsx";
import MapPage from "./page/MapPage.jsx";
import EnergyPage from "./page/EnergyPage.jsx";
import HistoryPage from "./page/HistoryPage.jsx";
import ServicePackage from "./page/ServicePackage.jsx";
import SettingPage from "./page/SettingPage.jsx";
import NotFoundPage from "./page/NotFoundPage.jsx";
import Login from "./page/Login.jsx";
import Register from "./page/Register.jsx";
import WelcomePage from "./page/WelcomePage.jsx";
import SessionStaffPage from "./page/SessionStaffPage.jsx";
import WaitingStaffPage from "./page/WaitingStaffPage.jsx";
import OTPVerification from "./page/OTPVerification.jsx";
import EVAdminDashboard from "./page/EVAdminDashboard.jsx";
import UserManagementPage from "./page/UserManagementPage.jsx";
import TargetCursor from "./components/TargetCursor.jsx";

function App() {
  return (
    <BrowserRouter>
      <TargetCursor />
      <Routes>
        {/* Root redirect to app */}
        <Route path="/abc" element={<Navigate to="/app/home" replace />} />


        {/* Welcome & Auth Routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="otp-verification" element={<OTPVerification />} />

        {/* Protected Main App Routes */}
        <Route path="/app" element={<Layout />}>
          {/* Default route for /app */}


          <Route path="evadmindashboard" element={<EVAdminDashboard />} />
          <Route path="home" element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="energy" element={<EnergyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="servicepackage" element={<ServicePackage />} />
          <Route path="setting" element={<SettingPage />} />
          <Route path="sessionstaff" element={<SessionStaffPage />} />
          <Route path="waitingstaff" element={<WaitingStaffPage />} />
          <Route path="usermanagement" element={<UserManagementPage />} />
        </Route>

        <Route path="/virtualstation/:postId" element={<VirtualStationPage />} />

        <Route path="/virtualstation/:postId" element={<VirtualStationPage />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

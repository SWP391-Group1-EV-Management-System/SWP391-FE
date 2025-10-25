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
import VirtualStationPage from "./page/VirtualStationPage.jsx";
import ForgotPasswordPage from "./page/ForgotPasswordPage.jsx";
import AboutPage from "./page/AboutPage.jsx";
import NavbarWelcome from "./components/welcome/NavbarWelcome.jsx";

// Protected Route Components
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { AdminRoute, StaffRoute } from "./components/auth/AdminRoute.jsx";
import RootRedirect from "./components/auth/RootRedirect.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Smart root redirect based on authentication */}
        <Route path="/" element={<RootRedirect />} />

        {/* Welcome & About Routes with Navbar */}
        <Route element={<NavbarWelcome />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Auth Routes (no navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Main App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* User Routes - Accessible to all authenticated users */}
          <Route path="home" element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="energy" element={<EnergyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="servicepackage" element={<ServicePackage />} />
          <Route path="setting" element={<SettingPage />} />

          {/* Admin Only Routes */}
          <Route
            path="evadmindashboard"
            element={
              <AdminRoute>
                <EVAdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="usermanagement"
            element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            }
          />

          {/* Staff Routes - Accessible to Staff and Admin */}
          <Route
            path="sessionstaff"
            element={
              <StaffRoute>
                <SessionStaffPage />
              </StaffRoute>
            }
          />
          <Route
            path="waitingstaff"
            element={
              <StaffRoute>
                <WaitingStaffPage />
              </StaffRoute>
            }
          />
        </Route>

        {/* Virtual Station - Protected but accessible to all authenticated users */}
        <Route
          path="virtualstation/:postId"
          element={
            <ProtectedRoute>
              <VirtualStationPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { App as AntdApp } from "antd";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./page/HomePage.jsx";
import MapPage from "./page/MapPage.jsx";
import EnergyPage from "./page/SessionPage.jsx";
import HistoryPage from "./page/HistoryPage.jsx";
import ServicePackage from "./page/ServicePackage.jsx";
import VehicleRegistration from "./page/VehicleRegistrationPage.jsx";
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
import PaymentReturn from "./page/PaymentReturn.jsx";
import PaymentPage from "./page/PaymentPage.jsx";

// Driver Status Pages
import WaitingPage from "./page/WaitingListPage.jsx";
import BookingPage from "./page/BookingPage.jsx";

import PaymentHistory from "./page/PaymentHistoryPage.jsx";
// Protected Route Components
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import {
  AdminRoute,
  StaffRoute,
  ManagerRoute,
  DriverRoute,
} from "./components/auth/AdminRoute.jsx";
import RootRedirect from "./components/auth/RootRedirect.jsx";
import ChatBox from "./components/chat/ChatBox.jsx";

function App() {
  return (
    <AntdApp>
      <BrowserRouter>
        {/* ChatBox component - hiển thị trên tất cả các trang */}
        <ChatBox />
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
          <Route path="otp-verification" element={<OTPVerification />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Main App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<HomePage />} />

            {/* Driver Routes - Accessible to Driver role */}
            <Route path="home" element={<HomePage />} />
            {/* User Routes - Accessible to all authenticated users */}
            <Route
              path="payment-history"
              element={
                <DriverRoute>
                  <PaymentHistory />
                </DriverRoute>
              }
            />
            <Route
              path="map"
              element={
                <DriverRoute>
                  <MapPage />
                </DriverRoute>
              }
            />

            {/* Driver Status-Based Routes */}
            {/* Session Page (EnergyPage được dùng cho trạng thái session) */}
            <Route
              path="session"
              element={
                <DriverRoute>
                  <EnergyPage />
                </DriverRoute>
              }
            />
            <Route
              path="waiting"
              element={
                <DriverRoute>
                  <WaitingPage />
                </DriverRoute>
              }
            />
            <Route
              path="booking"
              element={
                <DriverRoute>
                  <BookingPage />
                </DriverRoute>
              }
            />

            {/* Legacy Energy Page - Redirect to session for backward compatibility */}
            <Route
              path="energy"
              element={<Navigate to="/app/session" replace />}
            />

            <Route
              path="history"
              element={
                <DriverRoute>
                  <HistoryPage />
                </DriverRoute>
              }
            />
            <Route
              path="servicepackage"
              element={
                <DriverRoute>
                  <ServicePackage />
                </DriverRoute>
              }
            />
            <Route
              path="vehicleregistration"
              element={
                <DriverRoute>
                  <VehicleRegistration />
                </DriverRoute>
              }
            />
            <Route
              path="payment/:paymentId"
              element={
                <DriverRoute>
                  <PaymentPage />
                </DriverRoute>
              }
            />
            <Route
              path="payment-return"
              element={
                <DriverRoute>
                  <PaymentReturn />
                </DriverRoute>
              }
            />

            {/* Admin / Manager Routes */}
            <Route
              path="evadmindashboard"
              element={
                <ManagerRoute>
                  <EVAdminDashboard />
                </ManagerRoute>
              }
            />
            <Route
              path="usermanagement"
              element={
                <ManagerRoute>
                  <UserManagementPage />
                </ManagerRoute>
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

          {/* Virtual Station - Public access (no login required) */}
          <Route
            path="virtualstation/:postId"
            element={<VirtualStationPage />}
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  );
}

export default App;

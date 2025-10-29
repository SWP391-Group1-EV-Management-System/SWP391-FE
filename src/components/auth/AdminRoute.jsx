import React from "react";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Admin Protected Route Component
 *
 * Wrapper cho các route chỉ dành cho Admin.
 * Kiểm tra xác thực và role ADMIN trước khi cho phép truy cập.
 *
 * @param {React.ReactNode} children - Các component con được bảo vệ
 * @param {React.ReactNode} fallback - Component hiển thị khi đang loading
 */
const AdminRoute = ({ children, fallback }) => {
  return (
    <ProtectedRoute requiredRoles="ADMIN" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Staff Protected Route Component
 *
 * Wrapper cho các route dành cho Staff và Admin.
 * Kiểm tra xác thực và role STAFF hoặc ADMIN trước khi cho phép truy cập.
 */
const StaffRoute = ({ children, fallback }) => {
  // Cho phép STAFF hoặc ADMIN
  return (
    <ProtectedRoute requiredRoles={["STAFF"]} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Manager Protected Route Component
 *
 * Wrapper cho các route dành cho Manager và Admin.
 */
const ManagerRoute = ({ children, fallback }) => {
  // Cho phép MANAGER hoặc ADMIN
  return (
    <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

const DriverRoute = ({ children, fallback }) => {
  return (
    <ProtectedRoute requiredRoles="DRIVER" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

export { AdminRoute, StaffRoute, ManagerRoute, DriverRoute };
export default AdminRoute;

import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

/**
 * Root Redirect Component
 *
 * Điều hướng thông minh từ trang root:
 * - Nếu đã đăng nhập: đi tới /app/home
 * - Nếu chưa đăng nhập: đi tới /welcome
 */
const RootRedirect = () => {
  const { user, loading } = useAuth();

  // Hiển thị loading trong khi kiểm tra authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Đang tải...
      </div>
    );
  }

  // Redirect dựa trên trạng thái đăng nhập
  return <Navigate to={user ? "/app/home" : "/welcome"} replace />;
};

export default RootRedirect;

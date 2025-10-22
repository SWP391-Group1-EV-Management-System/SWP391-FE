import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common";

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
      <div style={{ height: "100vh" }}>
        <LoadingSpinner
          type="pulse"
          size="large"
          color="primary"
          text="Đang khởi tạo ứng dụng..."
          fullHeight={true}
        />
      </div>
    );
  }

  // Redirect dựa trên trạng thái đăng nhập
  return <Navigate to={user ? "/app/home" : "/welcome"} replace />;
};

export default RootRedirect;

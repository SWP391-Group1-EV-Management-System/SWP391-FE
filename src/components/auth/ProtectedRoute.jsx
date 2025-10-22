import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

/**
 * Protected Route Component
 *
 * Kiểm tra xác thực người dùng trước khi cho phép truy cập route.
 * Nếu chưa đăng nhập, redirect về trang login.
 * Nếu có yêu cầu role cụ thể, kiểm tra quyền truy cập.
 *
 * @param {React.ReactNode} children - Các component con được bảo vệ
 * @param {string|string[]} requiredRoles - Các role được phép truy cập (tùy chọn)
 * @param {string} redirectTo - Đường dẫn redirect khi không có quyền (mặc định: '/login')
 * @param {React.ReactNode} fallback - Component hiển thị khi đang loading
 */
const ProtectedRoute = ({
  children,
  requiredRoles = null,
  redirectTo = "/login",
  fallback = <div>Đang kiểm tra xác thực...</div>,
}) => {
  const { user, loading, fetchUserProfile } = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Kiểm tra xác thự khi component mount
  useEffect(() => {
    const initAuth = async () => {
      if (!user && !loading) {
        try {
          await fetchUserProfile();
        } catch (error) {
          console.warn("[ProtectedRoute] Failed to fetch user profile:", error);
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, [user, loading, fetchUserProfile]);

  // Hiển thị loading khi đang khởi tạo hoặc đang load user
  if (!isInitialized || loading) {
    return fallback;
  }

  // Nếu chưa đăng nhập, redirect về login với state chứa intended destination
  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRoles) {
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // Không có quyền truy cập, redirect về trang chủ hoặc trang không có quyền
      return (
        <Navigate
          to="/app/home"
          state={{
            error: "Bạn không có quyền truy cập trang này",
            from: location.pathname,
          }}
          replace
        />
      );
    }
  }

  // Có quyền truy cập, render children
  return children;
};

export default ProtectedRoute;

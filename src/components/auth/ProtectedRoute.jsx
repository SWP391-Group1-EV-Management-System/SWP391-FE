import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common";

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
  fallback = (
    <LoadingSpinner
      type="pulse"
      size="medium"
      color="primary"
      text="Đang xác thực..."
      fullHeight={true}
    />
  ),
}) => {
  const { user, loading, fetchUserProfile } = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    const initAuth = async () => {
      console.log(
        "[ProtectedRoute] initAuth - user:",
        !!user,
        "loading:",
        loading
      );

      // Nếu đã có user, không cần loading
      if (user) {
        setIsInitialized(true);
        return;
      }

      // Chỉ hiển thị loading nếu thực sự cần fetch user
      if (!loading) {
        setShouldShowLoading(true);
        try {
          await fetchUserProfile();
        } catch (error) {
          // Nếu là 401/403, user chưa đăng nhập → redirect về login
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {
            console.log(
              "[ProtectedRoute] User not authenticated, will redirect to login"
            );
          } else {
            console.warn(
              "[ProtectedRoute] Unexpected error fetching user:",
              error
            );
          }
        } finally {
          setShouldShowLoading(false);
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [user, loading, fetchUserProfile]);

  // Chỉ hiển thị loading khi thực sự cần thiết
  if (!isInitialized || shouldShowLoading) {
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

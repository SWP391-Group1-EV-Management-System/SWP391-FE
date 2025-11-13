import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  login as loginService,
  logoutApi,
  getUserProfile,
} from "../services/authService";

/**
 * Hook quản lý xác thực người dùng
 * Xử lý login, logout, và quản lý thông tin user profile
 * @returns {Object} - Các hàm và state liên quan đến authentication
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const hasFetchedRef = useRef(false);

  /**
   * Lấy thông tin profile của user từ API
   * @returns {Promise<Object|null>} - Thông tin user hoặc null nếu có lỗi
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const me = await getUserProfile();
      if (me) setUser(me);
      return me;
    } catch (e) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-fetch user profile một lần khi khởi tạo ứng dụng
   * Bỏ qua các trang public như login, register, forgot-password
   */
  useEffect(() => {
    // Skip auto-fetch ở các trang public
    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/welcome",
      "/about",
    ];
    if (publicPaths.some((path) => location.pathname.startsWith(path))) {
      return;
    }

    // Chỉ fetch nếu chưa có user VÀ chưa từng fetch
    if (!user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUserProfile();
    }
  }, [location.pathname]);

  /**
   * Xử lý đăng nhập người dùng
   * @param {string} email - Email đăng nhập
   * @param {string} password - Mật khẩu
   * @param {string} redirectTo - Đường dẫn chuyển hướng sau khi đăng nhập thành công
   * @returns {Promise<boolean>} - true nếu đăng nhập thành công, false nếu thất bại
   */
  const login = useCallback(
    async (email, password, redirectTo = "/app/home") => {
      setLoading(true);
      setError(null);
      try {
        const result = await loginService(email, password);
        if (result?.success) {
          try {
            await fetchUserProfile();
          } catch (e) {
            // Bỏ qua lỗi fetch profile sau login
          }

          navigate(redirectTo);
          return true;
        }
        setError(new Error(result?.message || "Đăng nhập thất bại."));
        return false;
      } catch (e) {
        setError(e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, fetchUserProfile]
  );

  /**
   * Xử lý đăng xuất người dùng
   * Xóa thông tin user và chuyển hướng về trang login
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutApi();
    } catch (e) {
      setError(e);
    } finally {
      setUser(null);
      hasFetchedRef.current = false;
      setLoading(false);
      window.location.href = "/welcome";
    }
  }, []);

  return { login, logout, loading, error, user, setUser, fetchUserProfile };
};

/**
 * Hook quản lý phân quyền dựa trên role của user
 * Cung cấp các hàm kiểm tra quyền và thông tin role
 * @returns {Object} - Thông tin role và các hàm kiểm tra quyền
 */
export const useRole = () => {
  const { user } = useAuth();

  /**
   * Kiểm tra user có role cụ thể hay không
   * @param {string} requiredRole - Role cần kiểm tra
   * @returns {boolean} - true nếu user có role đó
   */
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    const roles = user.role;
    if (Array.isArray(roles)) return roles.includes(requiredRole);
    return roles === requiredRole;
  };

  /**
   * Kiểm tra user có bất kỳ role nào trong danh sách hay không
   * @param {Array<string>} roles - Danh sách các role cần kiểm tra
   * @returns {boolean} - true nếu user có ít nhất 1 role trong danh sách
   */
  const hasAnyRole = (roles = []) => {
    if (!user) return false;
    const userRoles = user.role;
    if (!userRoles) return false;
    if (Array.isArray(userRoles))
      return roles.some((r) => userRoles.includes(r));
    return roles.some((r) => userRoles === r);
  };

  return useMemo(
    () => ({
      userRole: Array.isArray(user?.role) ? user.role : user?.role,
      userId: user?.id || user?.userId || null,
      hasRole,
      hasAnyRole,
      isAdmin: hasRole("ADMIN"),
      isManager: hasRole("MANAGER"),
      isDriver: hasRole("DRIVER"),
      isStaff: hasRole("STAFF"),
    }),
    [user]
  );
};

/**
 * Hook wrapper cho chức năng login
 * @returns {Object} - Hàm login và các state liên quan
 */
export const useLogin = () => {
  const { login, loading, error } = useAuth();
  return { login, loading, error };
};

/**
 * Hook wrapper cho chức năng logout
 * @returns {Object} - Hàm logout và các state liên quan
 */
export const useLogout = () => {
  const { logout, loading, error } = useAuth();
  return { logout, loading, error };
};

export default useAuth;

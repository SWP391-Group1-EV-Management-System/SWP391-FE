import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  login as loginService,
  logoutApi,
  getUserProfile,
} from "../services/authService";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const hasFetchedRef = useRef(false);

  // Fetch user profile helper
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const me = await getUserProfile();
      if (me) setUser(me);
      return me;
    } catch (e) {
      console.error("[useAuth] fetchUserProfile error", e);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chỉ auto-fetch user một lần khi khởi tạo ứng dụng
  useEffect(() => {
    console.log("🔍 useAuth useEffect triggered");
    console.log("- Current user:", user);
    console.log("- Current path:", location.pathname);
    console.log("- Has fetched:", hasFetchedRef.current);

    // Skip auto-fetch ở các trang public
    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/welcome",
      "/about",
    ];
    if (publicPaths.some((path) => location.pathname.startsWith(path))) {
      console.log("⏭️ Skipping auto-fetch on public page");
      return;
    }

    // Chỉ fetch nếu chưa có user VÀ chưa từng fetch
    if (!user && !hasFetchedRef.current) {
      console.log("📡 Auto-fetching user profile...");
      hasFetchedRef.current = true;
      fetchUserProfile().catch((err) => {
        // Suppress 401/403 errors on initial load - user not logged in yet
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("⚠️ Not authenticated (expected on initial load)");
        } else {
          console.error("❌ Unexpected error fetching user:", err);
        }
      });
    }
  }, [location.pathname, user, fetchUserProfile]);

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
            console.error("[useAuth] fetchUserProfile after login failed", e);
          }

          navigate(redirectTo);
          return true;
        }
        setError(new Error(result?.message || "Đăng nhập thất bại."));
        return false;
      } catch (e) {
        console.error("[useAuth] login error", e);
        setError(e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, fetchUserProfile]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutApi();
    } catch (e) {
      console.error("[useAuth] logout API error", e);
      setError(e);
    } finally {
      setUser(null);
      hasFetchedRef.current = false;
      setLoading(false);
      window.location.href = "/login";
    }
  }, []);

  return { login, logout, loading, error, user, setUser, fetchUserProfile };
};

// Role-based access control hook
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    const roles = user.role;
    if (Array.isArray(roles)) return roles.includes(requiredRole);
    return roles === requiredRole;
  };

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
      userId: user?.id || user?.userId || null, // ← THÊM DÒNG NÀY
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

// Convenience wrappers
export const useLogin = () => {
  const { login, loading, error } = useAuth();
  return { login, loading, error };
};

export const useLogout = () => {
  const { logout, loading, error } = useAuth();
  return { logout, loading, error };
};

export default useAuth;

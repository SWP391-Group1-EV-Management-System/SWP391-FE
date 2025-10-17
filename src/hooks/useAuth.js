import { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { login as loginService, logoutApi, me as meService } from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Chỉ auto-fetch user nếu KHÔNG ở trang login/register
  useEffect(() => {
    let mounted = true;
    
    // Skip auto-fetch ở các trang public
    const publicPaths = ['/login', '/register', '/forgot-password'];
    if (publicPaths.some(path => location.pathname.startsWith(path))) {
      return;
    }

    (async () => {
      try {
        const me = await meService();
        if (mounted && me) setUser(me);
      } catch (e) {
        // ignore - not logged in
      }
    })();
    
    return () => { mounted = false; };
  }, [location.pathname]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginService(email, password);
      if (result?.success) {
        try {
          const me = await meService();
          if (me) setUser(me);
        } catch (e) {
          console.error('[useAuth] fetch /users/me after login failed', e);
        }

        navigate('/app/home');
        return true;
      }
      setError(new Error(result?.message || 'Đăng nhập thất bại.'));
      return false;
    } catch (e) {
      console.error('[useAuth] login error', e);
      setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutApi();
    } catch (e) {
      console.error('[useAuth] logout API error', e);
      setError(e);
    } finally {
      setUser(null);
      setLoading(false);
      window.location.href = '/login';
    }
  }, []);

  return { login, logout, loading, error, user, setUser };
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
    if (Array.isArray(userRoles)) return roles.some(r => userRoles.includes(r));
    return roles.some(r => userRoles === r);
  };

  return useMemo(() => ({
    userRole: Array.isArray(user?.role) ? user.role : user?.role,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('ADMIN'),
    isManager: hasRole('MANAGER'),
    isDriver: hasRole('DRIVER'),
    isStaff: hasRole('STAFF'),
  }), [user]);
};

// Convenience wrappers so existing code that uses useLogin / useLogout can keep the same hook names
export const useLogin = () => {
  const { login, loading, error } = useAuth();
  return { login, loading, error };
};

export const useLogout = () => {
  const { logout, loading, error } = useAuth();
  return { logout, loading, error };
};

export default useAuth;

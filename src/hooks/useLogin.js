import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { login as loginService } from '../services/authService';

export const useLogin = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    console.log('[useLogin] login called', { email, password });
    try {
      const result = await loginService(email, password);
      console.log('[useLogin] login result', result);
      if (result.success) {
        localStorage.setItem('isLoggedIn', 'true');
        // JWT is now handled via HTTP-only cookie
        navigate('/app/home');
        return true;
      }
    } catch (error) {
      console.error('[useLogin] Login error:', error);
      alert(error.message || 'Đăng nhập thất bại.');
      return false;
    }
  }, [navigate]);

  return { login };
};
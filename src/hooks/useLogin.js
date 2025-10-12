import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { login as loginService } from '../services/authService';

export const useLogin = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    try {
      const userData = await loginService(email, password);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      // Đảm bảo lưu đúng userId
      const userId = userData.userID || userData.userId || userData.id || userData.idUser;
      if (userId) {
        localStorage.setItem('userId', userId);
        console.log('userId saved to localStorage:', userId);
      } else {
        console.warn('Không tìm thấy userId trong response đăng nhập:', userData);
      }
      navigate('/app/home');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Đăng nhập thất bại.');
      return false;
    }
  }, [navigate]);

  return { login };
};
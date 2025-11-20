import { useState, useEffect, useCallback, useRef } from 'react';
import { getDrivers, getStaff, updateUser, deleteUser } from '../services/userService';
import api from '../utils/axios';

const mapApiUser = (apiUser) => {
  // ✅ Backend dùng LocalDate → luôn trả string "YYYY-MM-DD" hoặc null
  const birthDate = apiUser.birthDate && apiUser.birthDate !== '' ? apiUser.birthDate : null;
  
  return {
    id: apiUser.userID || apiUser.id || apiUser.userId || apiUser.ID,
    email: apiUser.email || '',
    firstName: apiUser.firstName || '',
    lastName: apiUser.lastName || '',
    role: (apiUser.role || '').toLowerCase(),
    createdAt: apiUser.createdAt || '',
    gender: apiUser.gender === true ? 'Male' : apiUser.gender === false ? 'Female' : '',
    phone: apiUser.phoneNumber || apiUser.phone || '',
    status: apiUser.status === true || apiUser.active === true ? 'Active' : 'Inactive',
    birthDate: birthDate, // ✅ STRING "YYYY-MM-DD" hoặc null
    password: apiUser.password || '',
  };
};

const useUser = (role) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetch = useCallback(async () => {
    if (!role) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (role === 'Driver') {
        data = await getDrivers();
      } else if (role === 'Staff') {
        data = await getStaff();
      } else {
        data = [];
      }
      if (!mounted.current) return;
      setUsers(Array.isArray(data) ? data.map(mapApiUser) : []);
    } catch (err) {
      if (!mounted.current) return;
      setError(err);
      setUsers([]);
      console.error('useUser fetch error:', err);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    mounted.current = true;
    fetch();
    return () => {
      mounted.current = false;
    };
  }, [fetch]);

  const refresh = () => fetch();

  const update = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      await refresh();
      return { success: true };
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  const remove = async (userId) => {
    try {
      await deleteUser(userId);
      await refresh();
      return { success: true };
    } catch (err) {
      console.error('Delete user error:', err);
      throw err;
    }
  };

  return { users, loading, error, refresh, update, remove };
};

// ===== HOOK MỚI: useDashboard =====
export const useDashboard = (userId) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetchDashboard = useCallback(async () => {
    if (!userId) {
      setDashboardData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Đang tải dữ liệu dashboard cho user:', userId);
      const response = await api.get(`/api/driver/dashboard/information/${userId}`);
      
      if (!mounted.current) return;
      
      console.log('Dữ liệu dashboard nhận được:', response.data);
      setDashboardData(response.data);
    } catch (err) {
      if (!mounted.current) return;
      
      console.error('Lỗi khi tải dữ liệu dashboard:', err.response?.status, err.message);
      setError(err);
      
      // Fallback về dữ liệu mặc định
      setDashboardData({
        totalPriceIsPaid: 0,
        totalKwHBeCharged: 0,
        totalChargingSessionCompleted: 0,
        reputationPoint: 0,
      });
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    fetchDashboard();
    return () => {
      mounted.current = false;
    };
  }, [fetchDashboard]);

  const refresh = () => fetchDashboard();

  return { dashboardData, loading, error, refresh };
};

export default useUser;
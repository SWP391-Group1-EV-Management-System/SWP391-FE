import { useState, useEffect, useCallback, useRef } from 'react';
import { getDrivers, getStaff, updateUser, deleteUser } from '../services/userService';

const mapApiUser = (apiUser) => {
  console.log('🔥 Raw API User:', apiUser);
  console.log('🔥 birthDate:', apiUser.birthDate);
  
  // ✅ Backend dùng LocalDate → luôn trả string "YYYY-MM-DD" hoặc null
  const birthDate = apiUser.birthDate && apiUser.birthDate !== '' ? apiUser.birthDate : null;
  
  console.log('✅ Mapped birthDate:', birthDate);
  
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

export default useUser;

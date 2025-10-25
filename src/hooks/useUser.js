import { useState, useEffect, useCallback, useRef } from 'react';
import { getDrivers, getStaff, getManagers } from '../services/userService';

const mapApiUser = (apiUser) => ({
  id: apiUser.id || apiUser.userID || apiUser._id,
  email: apiUser.email || '',
  firstName: apiUser.firstName || '',
  lastName: apiUser.lastName || '',
  role: apiUser.role || '',
  createdAt: apiUser.createdAt || '',
  gender: apiUser.gender === true ? 'Male' : apiUser.gender === false ? 'Female' : '',
  phone: apiUser.phone || apiUser.phoneNumber || '',
  status: apiUser.active === true ? 'Active' : 'Inactive',
});

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
      } else if (role === 'Manager') {
        data = await getManagers();
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

  return { users, loading, error, refresh };
};

export default useUser;

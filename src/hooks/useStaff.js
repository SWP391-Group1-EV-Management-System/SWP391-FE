import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getStaffDashboardInfo, getAllSessions } from '../services/staffService';

// Hook quản lý dữ liệu dashboard nhân viên
export const useStaff = (userId) => {
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông tin dashboard
  const fetchDashboardInfo = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getStaffDashboardInfo(userId);
      setDashboardInfo(data);
    } catch (err) {
      setError(err);
      message.error('Không thể tải thông tin dashboard');
      console.error('Error fetching dashboard info:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Lấy danh sách phiên sạc
  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAllSessions(userId);
      setSessions(data);
    } catch (err) {
      setError(err);
      message.error('Không thể tải danh sách phiên sạc');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Làm mới dữ liệu
  const refreshData = useCallback(async () => {
    await Promise.all([fetchDashboardInfo(), fetchSessions()]);
    message.success('Đã làm mới dữ liệu!');
  }, [fetchDashboardInfo, fetchSessions]);

  // Tự động load dữ liệu khi mount
  useEffect(() => {
    if (userId) {
      fetchDashboardInfo();
      fetchSessions();
    }
  }, [userId, fetchDashboardInfo, fetchSessions]);

  return {
    dashboardInfo,
    sessions,
    loading,
    error,
    refreshData,
    fetchDashboardInfo,
    fetchSessions,
  };
};

export default useStaff;
import api from '../utils/axios';

// Lấy thông tin dashboard theo user
export const getStaffDashboardInfo = async (userId) => {
  try {
    const response = await api.get(`/api/staff/dashboard/information/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff dashboard info:', error);
    throw error;
  }
};

// Lấy danh sách tất cả phiên sạc theo user
export const getAllSessions = async (userId) => {
  try {
    const response = await api.get(`/api/staff/dashboard/all-sessions/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    throw error;
  }
};
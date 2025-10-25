import api from '../utils/axios';

export const getHistoryByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('[historyService] getHistoryByUserId error:', error);
    throw error;
  }
};
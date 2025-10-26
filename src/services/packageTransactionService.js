
import api from '../utils/axios';
export const getUserPackageTransactions = async (userId) => {
  const response = await api.get(`/api/packageTransaction/user/${userId}`);
  return response.data;
};

export const getActivePackageTransaction = async (userId) => {
  const transactions = await getUserPackageTransactions(userId);
  return transactions.find(t => t.status === 'ACTIVE') || null;
};

export default {
  getUserPackageTransactions,
  getActivePackageTransaction,
};
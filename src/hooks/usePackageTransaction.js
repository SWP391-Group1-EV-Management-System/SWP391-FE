// hooks/usePackageTransaction.js
import { useState, useCallback } from 'react';
import { 
  getUserPackageTransactions, 
  getActivePackageTransaction 
} from '../services/packageTransactionService';

// Hook quản lý package transaction
export const usePackageTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy tất cả package transactions của user
  const fetchUserTransactions = useCallback(async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getUserPackageTransactions(userId);
      setTransactions(data);
      
      const active = data.find(t => t.status === 'ACTIVE');
      setActiveTransaction(active || null);
      
      return data;
    } catch (err) {
      setError(err.response?.data || err.message);
      setTransactions([]);
      setActiveTransaction(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy transaction đang ACTIVE
  const fetchActiveTransaction = useCallback(async (userId) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const active = await getActivePackageTransaction(userId);
      setActiveTransaction(active);
      return active;
    } catch (err) {
      setError(err.response?.data || err.message);
      setActiveTransaction(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    activeTransaction,
    loading,
    error,
    fetchUserTransactions,
    fetchActiveTransaction,
  };
};

export default usePackageTransaction;
import { useState, useCallback } from 'react';
import { getHistoryByUserId } from '../services/historyService';

// Hook lấy lịch sử giao dịch
export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy lịch sử theo userId
  const fetchHistory = useCallback(async (userId) => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getHistoryByUserId(userId);
      setHistory(data || []);
    } catch (err) {
      setError(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    history, 
    loading, 
    error, 
    fetchHistory 
  };
};

export default useHistory;
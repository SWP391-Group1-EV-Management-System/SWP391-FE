import { useState, useCallback } from 'react';
import { getHistoryByUserId } from '../services/historyService';

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (userId) => {
    if (!userId) {
      console.warn('[useHistory] No user ID provided');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getHistoryByUserId(userId);
      setHistory(data || []);
    } catch (err) {
      console.error('[useHistory] fetchHistory error:', err);
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
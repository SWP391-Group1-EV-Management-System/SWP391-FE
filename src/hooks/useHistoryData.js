import { useState, useEffect, useMemo } from 'react';
import { fetchChargingHistory } from '../services/historyService';

export const useHistoryData = () => {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedSession, setExpandedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call real API instead of mock data
        const data = await fetchChargingHistory();
        setSessions(data);
        
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu lịch sử sạc');
        console.error('Error loading charging history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = sessions.filter(session => {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.station_name.toLowerCase().includes(searchLower) ||
        session.charging_session_id.toLowerCase().includes(searchLower) ||
        (session.user_name && session.user_name.toLowerCase().includes(searchLower))
      );
    });

    // Sort by start_time
    filtered.sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [sessions, searchTerm, sortOrder]);

  const summary = useMemo(() => {
    const completedSessions = sessions.filter(s => s.is_done);
    
    return {
      totalSessions: sessions.length,
      totalEnergy: completedSessions.reduce((sum, s) => sum + (s.kwh || 0), 0),
      totalCost: completedSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0),
      totalTime: completedSessions.reduce((sum, s) => {
        if (s.start_time && s.end_time) {
          const duration = new Date(s.end_time) - new Date(s.start_time);
          return sum + Math.round(duration / (1000 * 60)); // minutes
        }
        return sum;
      }, 0)
    };
  }, [sessions]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortOrder('desc');
  };

  return {
    sessions,
    filteredData,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    summary,
    expandedSession,
    setExpandedSession,
    loading,
    error,
    handleClearFilters
  };
};
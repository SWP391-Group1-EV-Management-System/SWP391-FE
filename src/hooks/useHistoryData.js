import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { chargingStationService, stationDataMapper } from '../services/chargingStationService';
import { useChargingStations } from './useChargingStations';

const API_BASE_URL = 'http://localhost:8080';

export const useHistoryData = () => {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedSession, setExpandedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { stations: allStations } = useChargingStations({ autoFetch: true });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setSessions([]);
          setLoading(false);
          return;
        }
        // Lấy danh sách payment của user
        const paymentRes = await axios.get(`${API_BASE_URL}/api/payment/paymentByUser/${userId}`);
        const payments = paymentRes.data || [];
        // Lấy chi tiết từng phiên sạc
        const sessionDetails = await Promise.all(
          payments.map(async (payment) => {
            try {
              const sessionRes = await axios.get(`${API_BASE_URL}/api/charging/session/show/${payment.chargingSessionId}`);
              const session = sessionRes.data;
              console.log('Session object:', session);
              // Lấy tên trạm từ danh sách trạm đã có
              let stationName = '';
              const stationId = session.station;
              console.log('Session:', session.chargingSessionId, 'stationId:', stationId, 'allStations:', allStations);
              if (stationId) {
                const foundStation = allStations.find(s => s.id === stationId);
                console.log('Tìm thấy trạm:', foundStation);
                stationName = foundStation?.name || 'Trạm chưa đặt tên';
                console.log('Tên trạm từ danh sách:', stationId, stationName);
              }
              // Lấy tên trụ bằng service
              let postName = '';
              const postId = session.chargingPost;
              console.log('Session:', session.chargingSessionId, 'postId:', postId);
              if (stationId && postId) {
                try {
                  const posts = await chargingStationService.getStationPosts(stationId);
                  console.log('Lấy danh sách trụ:', stationId, posts);
                  const post = posts.find(p => p.id === postId);
                  console.log('Trụ tìm được:', postId, post);
                  postName = post?.name || 'Trụ chưa đặt tên';
                  console.log('Tên trụ:', postName);
                } catch (err) {
                  console.error('Lỗi lấy tên trụ:', err);
                }
              }
              return {
                charging_session_id: session.chargingSessionId || '',
                station_name: stationName,
                post_name: postName,
                start_time: session.startTime || '',
                end_time: session.endTime || '',
                kwh: session.kwh || 0,
                total_amount: session.totalAmount || 0,
                status: session.done ? 'Hoàn tất' : (session.status || 'Đang sạc'),
                is_done: session.done || false,
                plugType: session.chargingType?.nameChargingType || '',
                max_power: session.chargingPost?.maxPower || '',
                avgPower: session.avgPower || '',
                batteryStart: session.batteryStart || '',
                batteryEnd: session.batteryEnd || '',
                payment: payment || {},
              };
            } catch (err) {
              return null;
            }
          })
        );
        setSessions(sessionDetails.filter(Boolean));
      } catch (err) {
        setError('Không thể tải dữ liệu lịch sử sạc');
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
        session.charging_session_id.toLowerCase().includes(searchLower)
      );
    });
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
          return sum + Math.round(duration / (1000 * 60));
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
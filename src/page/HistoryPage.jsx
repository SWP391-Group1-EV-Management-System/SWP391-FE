import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Typography, Space } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import HistorySummary from '../components/history/HistorySummary';
import HistoryList from '../components/history/HistoryList';
import HistorySessionDetail from '../components/history/HistorySessionDetail';
import NoDataMessage from '../components/history/NoDataMessage';
import HistoryFilters from '../components/history/HistoryFilters';

const { Title, Text } = Typography;

const HistoryPage = () => {
  const { user } = useAuth();
  const { history, loading, error, fetchHistory } = useHistory();
  const [selectedSession, setSelectedSession] = useState(null);

  // filter state
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('desc');

  useEffect(() => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  }, [user?.id, fetchHistory]);

  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    let filtered = [...history];

    // 1. Filter theo query (tìm theo sessionId, tên trạm, địa chỉ)
    if (query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.sessionId?.toLowerCase().includes(searchLower) ||
        item.station?.name?.toLowerCase().includes(searchLower) ||
        item.station?.address?.toLowerCase().includes(searchLower)
      );
    }

    // 2. Sort theo thời gian
    filtered.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return sort === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [history, query, sort]);

  const handleViewDetail = (session) => {
    setSelectedSession(session);
    // Scroll to top khi xem chi tiết
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSession(null);
  };

  const handleRefresh = () => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  };

  // Nếu đang xem chi tiết
  if (selectedSession) {
    return (
      <HistorySessionDetail 
        session={selectedSession} 
        onBack={handleBackToList} 
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        padding: '4rem', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white'
      }}>
        <Space direction="vertical" size="large" align="center">
          <Spin size="large" />
          <Text style={{ fontSize: '1.4rem', color: '#666' }}>
            Đang tải lịch sử sạc...
          </Text>
        </Space>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: '4rem', 
        background: 'white',
        minHeight: '60vh'
      }}>
        <Title level={2} style={{ marginBottom: '2rem', color: '#000' }}>
          Lịch sử sạc
        </Title>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,77,79,0.2)',
          textAlign: 'center'
        }}>
          <Text style={{ fontSize: '1.4rem', color: '#ff4d4f', display: 'block', marginBottom: '1rem' }}>
            Không thể tải lịch sử sạc
          </Text>
          <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block' }}>
            {error.message || 'Đã xảy ra lỗi'}
          </Text>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div style={{ 
      padding: '2rem', 
      background: 'white', 
      minHeight: '100vh' 
    }}>
      <Title 
        level={2} 
        style={{ 
          marginBottom: '2rem', 
          color: '#000',
          fontSize: '2.4rem',
          fontWeight: 700
        }}
      >
        Lịch sử sạc
      </Title>
      
      {/* Summary Cards */}
      {history && history.length > 0 && (
        <HistorySummary history={history} />
      )}
      
      {/* History List hoặc No Data */}
      {history && history.length > 0 ? (
        <HistoryList 
          history={filteredHistory} // Dùng data đã filter
          onViewDetail={handleViewDetail}
          filterComponent={
            <HistoryFilters
              query={query}
              sort={sort}
              onChangeQuery={setQuery}
              onChangeSort={setSort}
              // onApply removed — filtering is applied automatically
            />
          }
        />
      ) : (
        <NoDataMessage onRefresh={handleRefresh} />
      )}
    </div>
  );
};

export default HistoryPage;
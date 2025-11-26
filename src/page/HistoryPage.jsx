// Trang lịch sử sạc - hiển thị danh sách phiên sạc đã hoàn thành
import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Typography, Space } from 'antd';
import { ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import HistorySummary from '../components/history/HistorySummary';
import HistoryList from '../components/history/HistoryList';
import HistorySessionDetail from '../components/history/HistorySessionDetail';
import NoDataMessage from '../components/history/NoDataMessage';
import HistoryFilters from '../components/history/HistoryFilters';
import PageHeader from '../components/PageHeader';

const { Title, Text } = Typography;

const HistoryPage = () => {
  const { user } = useAuth();
  const { history, loading, error, fetchHistory } = useHistory();
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('desc');

  // Tải lịch sử sạc của user khi component mount
  useEffect(() => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  }, [user?.id, fetchHistory]);

  // Lọc và sắp xếp danh sách lịch sử theo query và sort
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    let filtered = [...history];

    // Filter theo query (tìm theo sessionId, tên trạm, địa chỉ)
    if (query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.sessionId?.toLowerCase().includes(searchLower) ||
        item.station?.name?.toLowerCase().includes(searchLower) ||
        item.station?.address?.toLowerCase().includes(searchLower)
      );
    }

    // Sắp xếp theo thời gian
    filtered.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return sort === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [history, query, sort]);

  // Mở modal xem chi tiết session
  const handleViewDetail = (session) => {
    setSelectedSession(session);
    // Scroll to top khi xem chi tiết
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quay lại danh sách từ chi tiết
  const handleBackToList = () => {
    setSelectedSession(null);
  };

  // Làm mới danh sách lịch sử
  const handleRefresh = () => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  };

  // Hiển thị chi tiết session nếu đã chọn
  if (selectedSession) {
    return (
      <HistorySessionDetail 
        session={selectedSession} 
        onBack={handleBackToList} 
      />
    );
  }

  // Hiển thị loading
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

  // Hiển thị lỗi
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

  // Hiển thị danh sách lịch sử với filter
  return (
    <div style={{ 
      padding: '2rem', 
      background: 'white', 
      minHeight: '100vh' 
    }}>
      {/* Header trang */}
      <PageHeader
        title="Lịch sử sạc"
        icon={<ThunderboltOutlined style={{ fontSize: 24 }} />}
      />

      {/* Tổng quan thống kê lịch sử */}
      {history && history.length > 0 && (
        <HistorySummary history={history} />
      )}
      
      {/* Danh sách lịch sử với bộ lọc hoặc thông báo không có dữ liệu */}
      {history && history.length > 0 ? (
        <HistoryList 
          history={filteredHistory}
          onViewDetail={handleViewDetail}
          filterComponent={
            <HistoryFilters
              query={query}
              sort={sort}
              onChangeQuery={setQuery}
              onChangeSort={setSort}
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
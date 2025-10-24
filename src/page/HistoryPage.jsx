import React from 'react';
import { Row, Col, Spin, Alert, ConfigProvider, Empty } from 'antd';
import { LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import HistoryFilters from '../components/history/HistoryFilters';
import HistorySummary from '../components/history/HistorySummary';
import HistoryList from '../components/history/HistoryList';
import NoDataMessage from '../components/history/NoDataMessage';

const HistoryPage = () => {
  // Hard-coded data replacing useHistoryData
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [expandedSession, setExpandedSession] = React.useState(null);
  const loading = false;
  const error = null;

  const filteredData = [
    {
      charging_session_id: 'CS-001',
      startTime: '2025-10-01T08:30:00Z',
      endTime: '2025-10-01T09:15:00Z',
      kWh: '12.50',
      price: 75.0,
      charging_post_name: 'Cổng A1',
      is_paid: true
    },
    {
      charging_session_id: 'CS-002',
      startTime: '2025-09-28T14:00:00Z',
      endTime: '2025-09-28T15:20:00Z',
      kWh: '18.30',
      price: 109.8,
      charging_post_name: 'Cổng B2',
      is_paid: false
    }
  ];

  const summary = {
    totalSessions: filteredData.length,
    totalKWh: filteredData.reduce((acc, s) => acc + parseFloat(s.kWh || 0), 0),
    totalCost: filteredData.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0),
  };

  const handleRowClick = (session) => {
    const id = session?.charging_session_id || session?.chargingSessionId || null;
    setExpandedSession(expandedSession === id ? null : id);
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setSortOrder('desc');
  };

  const loadingIcon = <LoadingOutlined style={{ fontSize: 48, color: '#28a745' }} spin />;

  // Loading state
  if (loading) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#28a745',
            colorBorder: '#d4edda',
            colorBgContainer: '#ffffff',
          },
        }}
      >
        <div style={{
          background: '#ffffff',
          minHeight: '100vh',
          padding: '2rem 1rem',
          paddingTop: '8rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spin 
              indicator={loadingIcon} 
              size="large"
              style={{ marginBottom: '1.5rem' }}
            />
            <div style={{ 
              color: '#155724', 
              fontSize: '1.6rem',
              fontWeight: 600
            }}>
              Đang tải lịch sử sạc xe...
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#28a745',
            colorBorder: '#d4edda',
            colorBgContainer: '#ffffff',
          },
        }}
      >
        <div style={{
          background: '#ffffff',
          minHeight: '100vh',
          padding: '2rem 1rem',
          paddingTop: '8rem'
        }}>
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Alert
                message="Có lỗi xảy ra"
                description={error}
                type="error"
                showIcon
                style={{
                  fontSize: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #f5c6cb',
                  background: '#f8d7da'
                }}
              />
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    );
  }

  // Main content
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#28a745',
          colorBorder: '#d4edda',
          colorBgContainer: '#ffffff',
          fontSize: 14,
          borderRadius: 6,
        },
        components: {
          Input: {
            colorBorder: '#d4edda',
            colorBorderHover: '#a3d2a8',
            colorPrimaryHover: '#34ce57',
          },
          Select: {
            colorBorder: '#d4edda',
            colorBorderHover: '#a3d2a8',
            colorPrimaryHover: '#34ce57',
          },
          Button: {
            colorPrimary: '#28a745',
            colorPrimaryHover: '#34ce57',
            colorPrimaryActive: '#1e7e34',
          },
          Card: {
            colorBorderSecondary: '#d4edda',
            boxShadowTertiary: '0 2px 8px rgba(40, 167, 69, 0.08)',
          }
        }
      }}
    >
      <div style={{
        background: '#ffffff',
        minHeight: '100vh',
        padding: '2rem 1rem',
        paddingTop: '8rem',
        fontSize: '1.5rem'
      }}>
        <Row gutter={[0, 24]}>
          {/* Page Header */}
          <Col span={24}>
            <PageHeader
              title="Lịch sử sạc xe điện"
              icon={<HistoryOutlined />}
            />
          </Col>
          
          {/* Filters */}
          <Col span={24}>
            <HistoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </Col>
          
          {/* Summary */}
          <Col span={24}>
            <HistorySummary summary={summary} />
          </Col>
          
          {/* List or No Data */}
          <Col span={24}>
            {filteredData && filteredData.length > 0 ? (
              <HistoryList
                sessions={filteredData}
                expandedSession={expandedSession}
                onRowClick={handleRowClick}
              />
            ) : (
              <NoDataMessage onClearFilter={handleClearFilter} />
            )}
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default HistoryPage;
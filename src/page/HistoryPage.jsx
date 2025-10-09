import React from 'react';
import { Row, Col, Spin, Alert, ConfigProvider } from 'antd';
import { LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import HistoryFilters from '../components/history/HistoryFilters';
import HistorySummary from '../components/history/HistorySummary';
import HistoryList from '../components/history/HistoryList';
import NoDataMessage from '../components/history/NoDataMessage';
import { useHistoryData } from '../hooks/useHistoryData';

const HistoryPage = () => {
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    summary,
    expandedSession,
    setExpandedSession,
    loading,
    error
  } = useHistoryData();

  const handleRowClick = (session) => {
    setExpandedSession(expandedSession === session.charging_session_id ? null : session.charging_session_id);
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setSortOrder('desc');
  };

  // Custom loading icon
  const loadingIcon = <LoadingOutlined style={{ fontSize: 48, color: '#28a745' }} spin />;

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
          paddingTop: '5rem',
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
              fontSize: '1.5rem',
              fontWeight: 500
            }}>
              Đang tải dữ liệu...
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

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
                  fontSize: '1.4rem',
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
        paddingTop: '5rem',
        fontSize: '1.5rem'
      }}>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <PageHeader
              title="Lịch sử sạc xe điện"
              icon={<HistoryOutlined />}
            />
          </Col>
          
          <Col span={24}>
            <HistoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </Col>
          
          <Col span={24}>
            <HistorySummary summary={summary} />
          </Col>
          
          <Col span={24}>
            {filteredData.length > 0 ? (
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

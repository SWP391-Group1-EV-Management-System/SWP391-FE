import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import HistorySessionCard from './HistorySessionCard';
import HistorySessionDetail from './HistorySessionDetail';

const { Title, Text } = Typography;

const HistoryList = ({ history, onViewDetail, filterComponent }) => {
  const [expandedSession, setExpandedSession] = React.useState(null);

  // Tìm session đang được expand
  const currentExpandedSession = history?.find(
    s => s.sessionId === expandedSession
  );

  const handleToggleExpand = (session) => {
    setExpandedSession(prev => prev === session.sessionId ? null : session.sessionId);
  };

  const handleViewDetail = (session) => {
    if (onViewDetail) {
      onViewDetail(session);
    }
  };

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <>
      {/* List Header */}
      <div style={{ 
        marginBottom: '2rem',
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(40,167,69,0.12)',
        boxShadow: '0 0 10px rgba(40,167,69,0.06)'
      }}>
        <Space align="center" size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center" size="middle">
            <UnorderedListOutlined style={{ 
              fontSize: '2.5rem', 
              color: '#28a745',
              background: 'linear-gradient(135deg, rgba(40,167,69,0.06), rgba(40,167,69,0.02))',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} />
            <Title 
              level={4} 
              style={{ 
                color: '#000',
                fontWeight: 700,
                fontSize: '2rem',
                margin: 0
              }}
            >
              Danh sách phiên sạc
            </Title>
          </Space>
          <Text 
            strong
            style={{ 
              fontSize: '1.6rem',
              color: '#08321a',
              background: 'linear-gradient(90deg, rgba(40,167,69,0.12), rgba(40,167,69,0.06))',
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              fontWeight: 700
            }}
          >
            {history.length} phiên
          </Text>
        </Space>
        {/* Divider removed */}
      </div>

      {/* Render filter component directly under the header if provided */}
      {filterComponent && (
        <div style={{ marginBottom: '1.5rem' }}>
          {filterComponent}
        </div>
      )}

      {/* Session Cards */}
      <Row>
        <Col span={24}>
          {history.map((session) => (
            <HistorySessionCard
              key={session.sessionId}
              session={session}
              isExpanded={expandedSession === session.sessionId}
              onToggleExpand={() => handleToggleExpand(session)}
              onViewDetail={handleViewDetail}
            />
          ))}
        </Col>
      </Row>

      {/* Expanded Session Detail (inline) */}
      {currentExpandedSession && (
        <div style={{ marginTop: '2rem' }}>
          <HistorySessionDetail 
            session={currentExpandedSession}
            onBack={() => setExpandedSession(null)}
          />
        </div>
      )}
    </>
  );
};

export default HistoryList;
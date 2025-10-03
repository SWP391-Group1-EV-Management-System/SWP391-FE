import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import HistorySessionCard from './HistorySessionCard';

const { Title } = Typography;

const HistoryList = ({ sessions, expandedSession, onRowClick }) => {
  return (
    <>
      {/* List Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Title 
          level={4} 
          style={{ 
            color: '#155724', 
            fontWeight: 600,
            fontSize: '2rem',
            margin: 0,
            paddingBottom: '0.75rem'
          }}
        >
          Danh sách phiên sạc ({sessions.length})
        </Title>
        <Divider style={{ margin: 0, borderColor: '#d4edda', borderWidth: '2px' }} />
      </div>

      {/* Session Cards */}
      <Row>
        <Col span={24}>
          {sessions.map((session) => (
            <HistorySessionCard
              key={session.charging_session_id}
              session={session}
              isExpanded={expandedSession === session.charging_session_id}
              onToggleExpand={() => onRowClick(session)}
            />
          ))}
        </Col>
      </Row>
    </>
  );
};

export default HistoryList;
import React from 'react';
import { Row, Col, Typography, Divider, Space } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import HistorySessionCard from './HistorySessionCard';
import HistorySessionDetail from './HistorySessionDetail';

const { Title, Text } = Typography;

const HistoryList = () => {
  // Hard-coded sessions data
  const [expandedSession, setExpandedSession] = React.useState(null);

  const sessions = [
    {
      charging_session_id: 'CS-001',
      startTime: '2025-10-01T08:30:00Z',
      endTime: '2025-10-01T09:15:00Z',
      kWh: '12.50',
      price: 75.0,
      charging_post_name: 'Cổng A1',
      is_paid: true,
      max_power: 22,
      avgPower: 18.5,
      batteryStart: 20,
      batteryEnd: 85
    },
    {
      charging_session_id: 'CS-002',
      startTime: '2025-09-28T14:00:00Z',
      endTime: '2025-09-28T15:20:00Z',
      kWh: '18.30',
      price: 109.8,
      charging_post_name: 'Cổng B2',
      is_paid: false,
      max_power: 50,
      avgPower: 32.1,
      batteryStart: 10,
      batteryEnd: 78
    },
    {
      charging_session_id: 'CS-003',
      startTime: '2025-09-20T10:10:00Z',
      endTime: '2025-09-20T11:00:00Z',
      kWh: '9.75',
      price: 58.5,
      charging_post_name: 'Cổng C3',
      is_paid: true,
      max_power: 11,
      avgPower: 9.8,
      batteryStart: 45,
      batteryEnd: 88
    }
  ];

  // Tìm session đang được expand
  const currentExpandedSession = sessions.find(
    s => s.charging_session_id === expandedSession
  );

  const onRowClick = (session) => {
    setExpandedSession(prev => prev === session.charging_session_id ? null : session.charging_session_id);
  };

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
                color: '#000',  // chữ đen
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
            {sessions.length} phiên
          </Text>
        </Space>
        <Divider style={{ margin: '1.5rem 0 0 0', borderColor: 'rgba(40,167,69,0.08)', borderWidth: '2px' }} />
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

      {/* Expanded Session Detail */}
      {currentExpandedSession && (
        <HistorySessionDetail />
      )}
    </>
  );
};

export default HistoryList;
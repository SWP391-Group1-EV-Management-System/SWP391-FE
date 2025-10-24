import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const HistorySessionDetail = () => {
  // Hard-coded session values
  const session = {
    charging_session_id: 'CS-001',
    startTime: '2025-10-01T08:30:00Z',
    endTime: '2025-10-01T09:15:00Z',
    max_power: 22,
    avgPower: 18.5,
    batteryStart: 20,
    batteryEnd: 85,
    kWh: '12.50',
    price: 75.0,
    charging_post_name: 'Cổng A1'
  };

  const detailItemStyle = {
    padding: '1.5rem',
    border: '1px solid rgba(40,167,69,0.12)',
    background: 'linear-gradient(135deg, #ffffff, #f8fffe)',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fffe, #f0f9f0)',
      padding: '2rem'
    }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(33, 78, 43, 0.12)',
              boxShadow: '0 6px 20px rgba(40,167,69,0.08)',
              height: '100%'
            }}
            styles={{ body: { padding: '2rem' } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title 
                level={4} 
                style={{ 
                  color: '#000',     // chữ đen
                  fontWeight: 700,
                  marginBottom: '2rem',
                  borderBottom: '3px solid rgba(40,167,69,0.18)',
                  paddingBottom: '1rem',
                  fontSize: '1.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <BarChartOutlined style={{ 
                  fontSize: '2.6rem',
                  background: 'linear-gradient(135deg, #28a745, #34ce57)',
                  borderRadius: '50%',
                  width: '3.6rem',
                  height: '3.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 0 0 6px rgba(32, 90, 46, 0.06)'
                }} />
                Thông tin chi tiết
              </Title>
              
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#fff',
                  boxShadow: 'none',
                  border: 'none',
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '1.7rem'
                }}
              >
                <tbody>
                  {[
                    { label: 'Mã phiên sạc:', value: session.charging_session_id },
                    { label: 'Công suất tối đa:', value: `${session.max_power || session.maxPower || 'N/A'} kW` },
                    { label: 'Công suất trung bình:', value: `${session.avgPower || 'N/A'} kW` },
                    { label: 'Pin đầu:', value: `${session.batteryStart || 'N/A'}%` },
                    { label: 'Pin cuối:', value: `${session.batteryEnd || 'N/A'}%` }
                  ].map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        transition: 'background 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(40,167,69,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? '#f8fffe' : '#fff'}
                    >
                      <td
                        style={{
                          padding: '1.5rem 2.5rem',
                          color: '#000', // chữ đen
                          fontWeight: 700,
                          fontSize: '1.35rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          width: '50%',
                          background: index % 2 === 0 ? '#f8fffe' : '#fff',
                          borderLeft: 'none'
                        }}
                      >
                        {item.label}
                      </td>
                      <td
                        style={{
                          padding: '1.5rem 2.5rem',
                          color: '#000', // chữ đen
                          fontWeight: 700,
                          fontSize: '1.45rem',
                          textAlign: 'right',
                          background: index % 2 === 0 ? '#fff' : '#eafaf1',
                          borderRight: 'none'
                        }}
                      >
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistorySessionDetail;
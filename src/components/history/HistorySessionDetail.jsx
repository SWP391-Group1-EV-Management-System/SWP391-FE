import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { formatDateTime, formatCurrency } from '../../utils/historyHelpers';

const { Title, Text } = Typography;

const HistorySessionDetail = ({ session }) => {
  const detailItemStyle = {
    padding: '1.5rem',
    border: '1px solid #d4edda',
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
        <Col lg={12} xs={24}>
          <Card
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #d4edda',
              borderLeft: '4px solid #28a745',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.08)',
              height: '100%'
            }}
            styles={{ 
              body: { padding: '2rem' }
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title 
                level={4} 
                style={{ 
                  color: '#28a745', 
                  fontWeight: 700,
                  marginBottom: '2rem',
                  borderBottom: '3px solid #28a745',
                  paddingBottom: '1rem',
                  fontSize: '1.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <BarChartOutlined style={{ 
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #28a745, #34ce57)',
                  borderRadius: '50%',
                  width: '3rem',
                  height: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }} />
                Thông tin chi tiết
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {[
                  { label: 'Mã phiên sạc:', value: session.charging_session_id },
                  { label: 'Công suất tối đa:', value: `${session.max_power || session.maxPower || 'N/A'} kW` },
                  { label: 'Công suất trung bình:', value: `${session.avgPower || 'N/A'} kW` },
                  { label: 'Pin đầu:', value: `${session.batteryStart || 'N/A'}%` },
                  { label: 'Pin cuối:', value: `${session.batteryEnd || 'N/A'}%` }
                ].map((item, index) => (
                  <div key={index} style={detailItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: '#28a745',
                        fontWeight: 700,
                        fontSize: '1.4rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        {item.label}
                      </Text>
                      <Text style={{ 
                        color: '#155724',
                        fontWeight: 700,
                        fontSize: '1.5rem'
                      }}>
                        {item.value}
                      </Text>
                    </div>
                  </div>
                ))}
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistorySessionDetail;
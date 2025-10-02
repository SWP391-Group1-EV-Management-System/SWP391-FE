import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { CalendarOutlined, ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { formatCurrency, formatDuration } from '../../utils/historyHelpers';

const { Title, Text } = Typography;

const HistorySummary = ({ summary }) => {
  const summaryCards = [
    {
      icon: <CalendarOutlined style={{ fontSize: '3rem', color: '#28a745' }} />,
      value: summary.totalSessions,
      label: 'Tổng phiên sạc'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '3rem', color: '#28a745' }} />,
      value: `${summary.totalEnergy.toFixed(1)} kWh`,
      label: 'Tổng năng lượng'
    },
    {
      icon: <DollarOutlined style={{ fontSize: '3rem', color: '#28a745' }} />,
      value: formatCurrency(summary.totalCost),
      label: 'Tổng chi phí'
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: '3rem', color: '#28a745' }} />,
      value: formatDuration(summary.totalTime),
      label: 'Tổng thời gian'
    }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <Row gutter={[16, 16]}>
        {summaryCards.map((card, index) => (
          <Col md={6} xs={12} key={index}>
            <Card
              style={{
                background: '#ffffff',
                border: '1px solid #d4edda',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.08)',
                transition: 'all 0.3s ease',
                height: '100%'
              }}
              styles={{
                body: {
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.15)';
                e.currentTarget.style.borderColor = '#a3d2a8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.08)';
                e.currentTarget.style.borderColor = '#d4edda';
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ marginBottom: '1rem' }}>
                  {card.icon}
                </div>
                
                <Title 
                  level={3} 
                  style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: '#28a745',
                    margin: '1rem 0 0.5rem 0',
                    lineHeight: 1.2
                  }}
                >
                  {card.value}
                </Title>
                
                <Text 
                  style={{
                    fontSize: '1.35rem',
                    color: '#155724',
                    fontWeight: 500,
                    margin: 0
                  }}
                >
                  {card.label}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HistorySummary;
import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { CalendarOutlined, ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDuration = (minutes) => {
  if (!minutes) return '0 phút';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

const HistorySummary = ({ history }) => {
  // Tính toán summary từ data thật
  const summary = React.useMemo(() => {
    if (!history || history.length === 0) {
      return {
        totalSessions: 0,
        totalEnergy: 0,
        totalCost: 0,
        totalTime: 0
      };
    }

    let totalEnergy = 0;
    let totalCost = 0;
    let totalMinutes = 0;

    history.forEach(session => {
      totalEnergy += session.kwh || 0;
      totalCost += session.totalAmount || 0;
      
      // Tính thời gian (phút)
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 1000 / 60);
        totalMinutes += diffMins;
      }
    });

    return {
      totalSessions: history.length,
      totalEnergy: totalEnergy,
      totalCost: totalCost,
      totalTime: totalMinutes
    };
  }, [history]);

  const summaryCards = [
    {
      icon: <CalendarOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: summary.totalSessions,
      label: 'Tổng phiên sạc',
      bgGradient: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: `${summary.totalEnergy.toFixed(1)} kWh`,
      label: 'Tổng năng lượng',
      bgGradient: 'linear-gradient(135deg, #fff9e6, #ffe599)'
    },
    {
      icon: <DollarOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: formatCurrency(summary.totalCost),
      label: 'Tổng chi phí',
      bgGradient: 'linear-gradient(135deg, #e6f7ff, #91d5ff)'
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: formatDuration(summary.totalTime),
      label: 'Tổng thời gian',
      bgGradient: 'linear-gradient(135deg, #fff1f0, #ffccc7)'
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
                border: '1px solid rgba(30, 55, 36, 0.18)',
                borderRadius: '12px',
                boxShadow: '0 0 8px rgba(32, 81, 44, 0.06), 0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
                height: '100%',
                overflow: 'hidden'
              }}
              styles={{ body: { padding: 0, height: '100%' } }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(40,167,69,0.18)';
                e.currentTarget.style.borderColor = 'rgba(40,167,69,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(40,167,69,0.06), 0 2px 8px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = 'rgba(40,167,69,0.18)';
              }}
            >
              <div style={{
                background: card.bgGradient,
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '8rem',
                borderBottom: '2px solid rgba(40,167,69,0.08)'
              }}>
                {card.icon}
              </div>
              
              <Space 
                direction="vertical" 
                size="small" 
                style={{ 
                  width: '100%',
                  padding: '2rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <Title 
                  level={3} 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#000',
                    margin: 0,
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  {card.value}
                </Title>
                
                <Text 
                  style={{
                    fontSize: '1.3rem',
                    color: '#0b2a18',
                    fontWeight: 600,
                    margin: 0,
                    display: 'block'
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
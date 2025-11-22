import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { ThunderboltOutlined, DollarOutlined, FireOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentHistorySummary = ({ payments }) => {
  // Lọc theo field 'paid' thay vì 'paymentId'
  const paidPayments = payments.filter(p => p.paid === true);
  const totalPrice = paidPayments.reduce((sum, item) => sum + item.price, 0);
  const totalKwh = paidPayments.reduce((sum, item) => sum + item.kwh, 0);
  const avgPrice = paidPayments.length > 0 ? totalPrice / paidPayments.length : 0;
  const unpaidCount = payments.filter(p => p.paid === false).length;
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  const summaryCards = [
    {
      icon: <DollarOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: formatCurrency(totalPrice),
      label: 'Tổng chi phí',
      bgGradient: 'linear-gradient(135deg, #e6f7ff, #91d5ff)'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: `${totalKwh.toFixed(1)} kWh`,
      label: 'Tổng điện năng',
      bgGradient: 'linear-gradient(135deg, #fff9e6, #ffe599)'
    },
    {
      icon: <FireOutlined style={{ fontSize: '3.5rem', color: '#28a745' }} />,
      value: formatCurrency(avgPrice),
      label: 'Chi phí TB',
      bgGradient: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'
    },
    {
      icon: <CreditCardOutlined style={{ fontSize: '3.5rem', color: unpaidCount > 0 ? '#ff9800' : '#28a745' }} />,
      value: unpaidCount,
      label: 'Chờ thanh toán',
      bgGradient: unpaidCount > 0 ? 'linear-gradient(135deg, #fff3e0, #ffcc80)' : 'linear-gradient(135deg, #fff1f0, #ffccc7)'
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

export default PaymentHistorySummary;
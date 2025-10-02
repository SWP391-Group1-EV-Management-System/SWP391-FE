import React from 'react';
import { Typography, Space } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PaymentHeader = () => {
  return (
    <header style={{
      marginTop: '6rem',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Space align="center" size="large">
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <DollarOutlined style={{
              fontSize: '2rem',
              color: 'white'
            }} />
          </div>
          
          <Title 
            level={1}
            style={{
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.5px'
            }}
          >
            EcoCharge Payment
          </Title>
        </Space>
      </div>
    </header>
  );
};

export default PaymentHeader;
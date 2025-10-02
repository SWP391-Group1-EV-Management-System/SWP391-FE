import React from 'react';
import { Radio, Typography, Space } from 'antd';
import { WalletOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentMethodSelection = ({ selectedMethod, handleMethodSelect }) => {
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Thanh toán tiền mặt',
      icon: <DollarOutlined style={{ fontSize: '2rem', color: '#10b981' }} />,
      description: 'Thanh toán trực tiếp bằng tiền mặt'
    },
    {
      id: 'e-wallet',
      name: 'Ví điện tử',
      icon: <WalletOutlined style={{ fontSize: '2rem', color: '#10b981' }} />,
      description: 'MoMo, ZaloPay, VNPay (QR Code)'
    }
  ];

  return (
    <div>
      <Title 
        level={5} 
        style={{
          fontSize: '2rem',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '1rem'
        }}
      >
        Chọn phương thức thanh toán
      </Title>
      
      <Radio.Group 
        value={selectedMethod} 
        onChange={(e) => handleMethodSelect(e.target.value)}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {paymentMethods.map((method) => (
            <Radio 
              key={method.id} 
              value={method.id}
              style={{
                width: '100%',
                margin: 0,
                padding: '1rem',
                border: `1px solid ${selectedMethod === method.id ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: selectedMethod === method.id ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                if (selectedMethod !== method.id) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMethod !== method.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%'
              }}>
                {method.icon}
                <div>
                  <Text strong style={{ fontSize: '1.7rem', color: '#111827' }}>
                    {method.name}
                  </Text>
                  <br />
                  <Text style={{ fontSize: '1.7rem', color: '#6b7280' }}>
                    {method.description}
                  </Text>
                </div>
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default PaymentMethodSelection;
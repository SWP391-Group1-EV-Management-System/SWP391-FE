import React from 'react';
import { Space } from 'antd';
import PaymentHistoryCard from './PaymentHistoryCard';

const PaymentHistoryList = ({ payments, onPayment }) => {
  return (
    <div style={{ marginTop: '2.4rem' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {payments.map((payment) => (
          <PaymentHistoryCard 
            key={payment.sessionId}
            payment={payment}
            onPayment={onPayment}
          />
        ))}
      </Space>
    </div>
  );
};

export default PaymentHistoryList;
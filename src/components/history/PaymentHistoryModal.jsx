import React from 'react';
import { Modal, Typography } from 'antd';
import { CreditCardOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentHistoryModal = ({ visible, session, onConfirm, onCancel }) => {
  if (!session) return null;

  return (
    <Modal
      title={
        <span style={{ color: '#1f7a1f', fontSize: '1.8rem', fontWeight: '600' }}>
          <CreditCardOutlined style={{ marginRight: '8px' }} />
          Xác nhận thanh toán
        </span>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Thanh toán"
      cancelText="Hủy"
      okButtonProps={{
        style: {
          backgroundColor: '#2d8f2d',
          borderColor: '#2d8f2d',
          fontWeight: '500',
          fontSize: '1.4rem',
          height: '4rem'
        }
      }}
      cancelButtonProps={{
        style: {
          fontSize: '1.4rem',
          height: '4rem'
        }
      }}
    >
      <div style={{ padding: '1.6rem 0' }}>
        <div style={{ 
          padding: '1.6rem', 
          backgroundColor: '#f6ffed', 
          borderRadius: '8px', 
          border: '1px solid #b7eb8f',
          marginBottom: '1.6rem'
        }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block' }}>
              Mã phiên
            </Text>
            <Text style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f7a1f' }}>
              {session.sessionId}
            </Text>
          </div>
          
          <div style={{ marginBottom: '1.2rem' }}>
            <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block' }}>
              Trạm sạc
            </Text>
            <Text style={{ fontSize: '1.4rem', fontWeight: 500 }}>
              {session.chargingStationName}
            </Text>
          </div>
          
          <div style={{ marginBottom: '1.2rem' }}>
            <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block' }}>
              Điện năng
            </Text>
            <Text style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2d8f2d' }}>
              <ThunderboltOutlined /> {session.kwh} kWh
            </Text>
          </div>
          
          <div>
            <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block' }}>
              Số tiền
            </Text>
            <Text style={{ fontSize: '2rem', fontWeight: 700, color: '#1f7a1f' }}>
              {session.price.toLocaleString('vi-VN')} VNĐ
            </Text>
          </div>
        </div>
        
        <Text style={{ fontSize: '1.3rem', color: '#666', textAlign: 'center', display: 'block' }}>
          Bạn có chắc chắn muốn thanh toán cho phiên sạc này?
        </Text>
      </div>
    </Modal>
  );
};

export default PaymentHistoryModal;
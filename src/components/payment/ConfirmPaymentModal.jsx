import React from 'react';
import { Modal, Typography } from 'antd';

const { Text, Title } = Typography;

const ConfirmPaymentModal = ({ 
  visible, 
  onConfirm, 
  onCancel, 
  totalAmount,
  paymentData = {},
  titleText = "Xác nhận thanh toán",
  messageText = "Bạn có chắc chắn muốn thanh toán?"
}) => {
  return (
    <Modal
      title={titleText}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Thanh toán ngay"
      cancelText="Quay lại"
      okButtonProps={{
        style: {
          backgroundColor: '#0b9459',
          borderColor: '#0b9459',
          color: '#ffffff'
        }
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Title level={4}>{messageText}</Title>
        
        <div style={{ marginTop: '16px' }}>
          <Text>Tổng tiền: </Text>
          <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
            {totalAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmPaymentModal;
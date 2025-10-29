import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { ThunderboltOutlined, CreditCardOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentHistoryCard = ({ payment, onPayment }) => {
  // Dùng field 'paid' thay vì kiểm tra paymentId
  const isPaid = payment.paid === true;

  return (
    <Card
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div style={{
        padding: '1.6rem 2rem',
        background: isPaid ? '#f6ffed' : '#fff7e6',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <Text style={{ fontSize: '1.1rem', color: '#666', display: 'block' }}>
            Mã phiên
          </Text>
          <Text style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f7a1f' }}>
            {payment.sessionId}
          </Text>
        </div>
        <div>
          <div style={{
            background: isPaid ? '#52c41a' : '#ff9800',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isPaid ? (
              <>
                <CheckCircleOutlined />
                Đã thanh toán
              </>
            ) : (
              <>
                <ClockCircleOutlined />
                Chưa thanh toán
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '1.2rem' }}>
              <Text style={{ fontSize: '1.2rem', color: '#999', display: 'block', marginBottom: '0.4rem' }}>
                Mã thanh toán
              </Text>
              {payment.paymentId ? (
                <Text style={{ fontSize: '1.4rem', fontWeight: 600, color: '#1f7a1f' }}>
                  {payment.paymentId}
                </Text>
              ) : (
                <Text style={{ fontSize: '1.4rem', color: '#ff9800', fontStyle: 'italic' }}>
                  Chưa có
                </Text>
              )}
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '1.2rem' }}>
              <Text style={{ fontSize: '1.2rem', color: '#999', display: 'block', marginBottom: '0.4rem' }}>
                Trạm sạc
              </Text>
              <Text style={{ fontSize: '1.4rem', fontWeight: 500, color: '#000' }}>
                {payment.chargingStationName}
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div>
              <Text style={{ fontSize: '1.2rem', color: '#999', display: 'block', marginBottom: '0.4rem' }}>
                Điện năng tiêu thụ
              </Text>
              <Text style={{ fontSize: '1.6rem', fontWeight: 600, color: '#2d8f2d' }}>
                <ThunderboltOutlined style={{ marginRight: '6px' }} />
                {payment.kwh} kWh
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div>
              <Text style={{ fontSize: '1.2rem', color: '#999', display: 'block', marginBottom: '0.4rem' }}>
                Số tiền
              </Text>
              <Text style={{ fontSize: '2rem', fontWeight: 700, color: '#1f7a1f' }}>
                {payment.price.toLocaleString('vi-VN')} VNĐ
              </Text>
            </div>
          </Col>
        </Row>

        {/* Action button - Chỉ hiện khi chưa thanh toán */}
        {!isPaid && (
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              style={{
                backgroundColor: '#2d8f2d',
                borderColor: '#2d8f2d',
                fontWeight: 600,
                fontSize: '1.4rem',
                height: '4.4rem',
                borderRadius: '8px',
                padding: '0 3rem'
              }}
              onClick={() => onPayment(payment)}
            >
              Thanh toán ngay
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentHistoryCard;
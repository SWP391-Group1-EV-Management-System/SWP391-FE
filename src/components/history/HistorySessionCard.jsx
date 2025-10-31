import React from 'react';
import { Card, Row, Col, Tag, Typography, Space, Divider } from 'antd';
import { 
  EnvironmentOutlined, 
  ThunderboltOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  FileOutlined, 
  CarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { PiPlugChargingLight } from "react-icons/pi";
const { Text } = Typography;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const HistorySessionCard = ({ session, onViewDetail }) => {
  const isPaid = session.payment?.paid || false;
  const isDone = session.done || false;

  return (
    <Card
      style={{
        marginBottom: '1.5rem',
        border: '1px solid rgba(40,167,69,0.18)',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(40,167,69,0.06), 0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        background: '#ffffff'
      }}
      hoverable
      styles={{ body: { padding: '2rem' } }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,167,69,0.12)';
        e.currentTarget.style.borderColor = 'rgba(40,167,69,0.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 10px rgba(40,167,69,0.06), 0 2px 8px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = 'rgba(40,167,69,0.18)';
      }}
    >
      {/* Hàng 1 - Trạng thái và Nút */}
      <Row gutter={[24, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Tag
            color={isPaid ? 'success' : 'processing'}
            style={{ 
              fontSize: '1.4rem', 
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              fontWeight: 600,
              border: 'none',
              background: isPaid ? 'linear-gradient(90deg, rgba(40,167,69,0.12), rgba(40,167,69,0.06))' : undefined,
              color: '#08321a'
            }}
          >
            {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
          
          {onViewDetail && (
            <Tag 
              icon={<EyeOutlined />}
              color="blue"
              style={{ 
                fontSize: '1.3rem', 
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(session);
              }}
            >
              Xem chi tiết
            </Tag>
          )}
        </Col>
      </Row>
      <Divider style={{ margin: '0 0 1rem 0'}} />
      <Row gutter={[24, 16]}>
        {/* Hàng 2 - Trạm, Mã, Cổng, PTTT */}
        <Col xs={12} sm={6} md={6}>
          <Text 
            strong 
            style={{ 
              fontSize: '1.5rem', 
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}
          >
            <EnvironmentOutlined style={{ fontSize: '1.7rem', color: '#28a745' }} />
            Trạm sạc
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {session.station?.name || 'N/A'}
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text 
            strong
            style={{ 
              fontSize: '1.5rem', 
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}
          >
            <CarOutlined style={{ color: '#28a745' }} />
            Mã phiên
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {session.sessionId}
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text 
            strong
            style={{ 
              fontSize: '1.5rem', 
              color: '#000',
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            <FileOutlined style={{ color: '#28a745' }} /> Phương thức
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {session.payment?.methodName || 'N/A'}
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text 
            strong
            style={{ 
              fontSize: '1.5rem', 
              color: '#000',
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            <PiPlugChargingLight style={{ color: '#28a745' }} />
            Cổng sạc
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {session.post?.id || 'N/A'}
          </Text>
        </Col>

        {/* Hàng 2 - Bắt đầu, Kết thúc, kWh, Giá */}
        <Col xs={12} sm={6} md={6}>
          <Text 
            strong
            style={{ 
              fontSize: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#000',
              marginBottom: '0.25rem'
            }}
          >
            <ClockCircleOutlined style={{ color: '#28a745' }} />
            Bắt đầu
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {formatDateTime(session.startTime)}
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text 
            strong
            style={{ 
              fontSize: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#000',
              marginBottom: '0.25rem'
            }}
          >
            <ClockCircleOutlined style={{ color: '#28a745' }} />
            Kết thúc
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: isDone ? '#666' : '#ff9800',
              display: 'block'
            }}
          >
            {isDone ? formatDateTime(session.endTime) : 'Đang sạc...'}
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text 
            strong 
            style={{ 
              fontSize: '1.5rem', 
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}
          >
            <ThunderboltOutlined style={{ fontSize: '1.9rem', color: '#28a745' }} />
            Điện năng
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {parseFloat(session.kwh || 0).toFixed(2)} kWh
          </Text>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Text
            strong
            style={{ 
              fontSize: '1.5rem',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              marginBottom: '0.25rem'
            }}
          >
            <DollarOutlined style={{ color: '#28a745' }} />
            Tổng chi phí
          </Text>
          <Text 
            style={{ 
              fontSize: '1.4rem', 
              color: '#666',
              display: 'block'
            }}
          >
            {formatCurrency(session.totalAmount)}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default HistorySessionCard;
import React from 'react';
import { Card, Row, Col, Tag, Typography, Space, Divider } from 'antd';
import { 
  EnvironmentOutlined, 
  ThunderboltOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  EyeOutlined
} from '@ant-design/icons';

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
      <Row gutter={[24, 16]} align="middle">
        {/* Cột 1: Thông tin trạm */}
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text 
              strong 
              style={{ 
                fontSize: '1.6rem', 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <EnvironmentOutlined style={{ fontSize: '1.8rem', color: '#28a745' }} />
              {session.station?.name || 'N/A'}
            </Text>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '1.25rem',
                paddingLeft: '2.5rem',
                color: '#222'
              }}
            >
              {session.station?.address || 'N/A'}
            </Text>
            <Divider style={{ margin: '0.75rem 0', borderColor: 'rgba(40,167,69,0.06)' }} />
            <Text 
              style={{ 
                fontSize: '1.2rem',
                color: '#222',
                paddingLeft: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CarOutlined style={{ color: '#28a745' }} />
              Mã: <strong>{session.sessionId}</strong>
            </Text>
            {session.post?.id && (
              <Text 
                style={{ 
                  fontSize: '1.2rem',
                  color: '#222',
                  paddingLeft: '2.5rem'
                }}
              >
                Cổng: <strong>{session.post.id}</strong>
              </Text>
            )}
          </Space>
        </Col>

        {/* Cột 2: Thời gian & Năng lượng */}
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text 
                style={{ 
                  fontSize: '1.15rem', 
                  color: '#666',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}
              >
                Bắt đầu
              </Text>
              <Text 
                strong
                style={{ 
                  fontSize: '1.35rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#000'
                }}
              >
                <ClockCircleOutlined style={{ color: '#28a745' }} />
                {formatDateTime(session.startTime)}
              </Text>
            </div>
            
            <div>
              <Text 
                style={{ 
                  fontSize: '1.15rem', 
                  color: '#666',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}
              >
                Kết thúc
              </Text>
              <Text 
                strong
                style={{ 
                  fontSize: '1.35rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: isDone ? '#000' : '#ff9800'
                }}
              >
                <ClockCircleOutlined style={{ color: isDone ? '#28a745' : '#ff9800' }} />
                {isDone ? formatDateTime(session.endTime) : 'Đang sạc...'}
              </Text>
            </div>
            
            <Divider style={{ margin: '0.5rem 0', borderColor: 'rgba(40,167,69,0.06)' }} />
            
            <Text 
              strong 
              style={{ 
                fontSize: '1.6rem', 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <ThunderboltOutlined style={{ fontSize: '1.8rem', color: '#28a745' }} />
              {parseFloat(session.kwh || 0).toFixed(2)} kWh
            </Text>
          </Space>
        </Col>

        {/* Cột 3: Giá & Trạng thái */}
        <Col xs={24} sm={24} md={8}>
          <div style={{ 
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1.5rem'
          }}>
            <div style={{ width: '100%' }}>
              <Text 
                style={{ 
                  fontSize: '1.15rem', 
                  color: '#666',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}
              >
                Tổng chi phí
              </Text>
              <Text
                strong
                style={{ 
                  fontSize: '2.2rem',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  fontWeight: 700
                }}
              >
                <DollarOutlined style={{ color: '#28a745' }} />
                {formatCurrency(session.totalAmount)}
              </Text>
              {session.payment?.methodName && (
                <Text 
                  style={{ 
                    fontSize: '1.1rem',
                    color: '#666',
                    display: 'block',
                    marginTop: '0.5rem'
                  }}
                >
                  {session.payment.methodName}
                </Text>
              )}
            </div>
            
            <Space direction="vertical" size="small" style={{ width: '100%', alignItems: 'flex-end' }}>
              <Tag
                color={isPaid ? 'success' : 'processing'}
                style={{ 
                  fontSize: '1.3rem', 
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
                    fontSize: '1.2rem', 
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
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default HistorySessionCard;
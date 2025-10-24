import React from 'react';
import { Card, Row, Col, Tag, Typography, Space, Divider } from 'antd';
import { 
  EnvironmentOutlined, 
  ThunderboltOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined
} from '@ant-design/icons';
import { formatCurrency, formatDateTime } from '../../utils/historyHelpers';

const { Text } = Typography;

const HistorySessionCard = ({ session, isExpanded, onToggleExpand }) => {
  const isPaid = session.is_paid || session.payment?.isPaid || session.isDone;
  const cost = session.price || session.totalAmount || session.payment?.price || 0;

  return (
    <Card
      style={{
        marginBottom: '1.5rem',
        border: isExpanded ? '2px solid rgba(40,167,69,0.38)' : '1px solid rgba(40,167,69,0.18)',
        borderRadius: '12px',
        boxShadow: isExpanded 
          ? '0 10px 34px rgba(40,167,69,0.18)' 
          : '0 0 10px rgba(40,167,69,0.06), 0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        background: '#ffffff'
      }}
      hoverable
      onClick={onToggleExpand}
      styles={{ body: { padding: '2rem' } }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isExpanded ? '0 12px 40px rgba(28, 66, 37, 0.22)' : '0 8px 24px rgba(40,167,69,0.12)';
        e.currentTarget.style.borderColor = isExpanded ? 'rgba(31, 74, 41, 0.45)' : 'rgba(40,167,69,0.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isExpanded ? '0 10px 34px rgba(30, 69, 39, 0.18)' : '0 0 10px rgba(40,167,69,0.06), 0 2px 8px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = isExpanded ? 'rgba(39, 87, 50, 0.38)' : 'rgba(40,167,69,0.18)';
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
                color: '#000',        // chữ đen
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <EnvironmentOutlined style={{ fontSize: '1.8rem', color: '#28a745' }} />
              Trạm Sạc Trung Tâm
            </Text>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '1.25rem',
                paddingLeft: '2.5rem',
                color: '#222'         // darker secondary
              }}
            >
              123 Đường Lớn, Quận 1, TP.HCM
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
              Mã: <strong>{session.charging_session_id}</strong>
            </Text>
            {session.charging_post_name && (
              <Text 
                style={{ 
                  fontSize: '1.2rem',
                  color: '#222',
                  paddingLeft: '2.5rem'
                }}
              >
                Cổng: <strong>{session.charging_post_name}</strong>
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
                  color: '#000'       // chữ đen
                }}
              >
                <ClockCircleOutlined style={{ color: '#28a745' }} />
                {formatDateTime(session.startTime)}
              </Text>
            </div>
            
            {session.endTime && (
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
                    color: '#000'      // chữ đen
                  }}
                >
                  <ClockCircleOutlined style={{ color: '#28a745' }} />
                  {formatDateTime(session.endTime)}
                </Text>
              </div>
            )}
            
            <Divider style={{ margin: '0.5rem 0', borderColor: 'rgba(40,167,69,0.06)' }} />
            
            <Text 
              strong 
              style={{ 
                fontSize: '1.6rem', 
                color: '#000',       // chữ đen
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <ThunderboltOutlined style={{ fontSize: '1.8rem', color: '#28a745' }} />
              {parseFloat(session.kWh || 0).toFixed(2)} kWh
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
                  color: '#000',      // chữ đen
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  fontWeight: 700
                }}
              >
                <DollarOutlined style={{ color: '#28a745' }} />
                {formatCurrency(cost)}
              </Text>
            </div>
            
            <Tag 
              icon={isPaid ? <CheckCircleOutlined /> : <SyncOutlined spin />}
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
              {isPaid ? 'Đã thanh toán' : 'Đang xử lý'}
            </Tag>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default HistorySessionCard;
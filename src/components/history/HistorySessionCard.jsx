import React from 'react';
import { Card, Row, Col, Tag, Typography, Space } from 'antd';
import { DownOutlined, UpOutlined, ClockCircleOutlined, ThunderboltOutlined, DollarOutlined, ApiOutlined } from '@ant-design/icons';
import { formatDateTime, formatCurrency, getStatusBadge } from '../../utils/historyHelpers';
import HistorySessionDetail from './HistorySessionDetail';

const { Text, Title } = Typography;

const HistorySessionCard = ({ session, isExpanded, onToggleExpand }) => {
  // Log giá trị tên trạm và tên trụ khi render card
  console.log('Card:', session.charging_session_id, 'Trạm:', session.station_name, 'Trụ:', session.post_name);

  const getStatusColor = (status) => {
    const statusMap = {
      'success': 'success',
      'completed': 'success', 
      'failed': 'error',
      'pending': 'processing',
      'active': 'blue'
    };
    return statusMap[getStatusBadge(status)] || 'default';
  };

  return (
    <Card
      style={{ 
        marginBottom: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.08)',
        transition: 'all 0.3s ease',
        border: '1px solid #d4edda'
      }}
      styles={{
        body: { padding: 0 } 
      }}
      hoverable
    >
      {/* Card Header */}
      <div 
        onClick={onToggleExpand}
        style={{ 
          cursor: 'pointer',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #ffffff, #f8fffe)',
          borderBottom: '1px solid #d4edda',
          borderRadius: '10px 10px 0 0',
          transition: 'background 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title 
              level={5} 
              style={{ 
                margin: 0, 
                color: '#155724', 
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              {session.station_name} - {session.post_name}
            </Title>
            <Tag 
              color={getStatusColor(session.status)}
              style={{ 
                fontSize: '1.2rem', 
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {session.status}
            </Tag>
          </Space>
          <Text style={{ color: '#28a745', fontSize: '1.2rem' }}>
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </Text>
        </div>
      </div>
      
      {/* Card Body */}
      <div style={{ padding: '1.5rem' }}>
        <Row gutter={[16, 16]}>
          <Col lg={6} md={12} xs={24}>
            <div style={{
              padding: '1.2rem',
              background: '#ffffff',
              borderRadius: '8px',
              borderLeft: '3px solid #d4edda',
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Space direction="vertical" size="small">
                <Text style={{ 
                  fontSize: '1.35rem', 
                  color: '#28a745', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <ClockCircleOutlined /> Thời gian
                </Text>
                <div>
                  <Text strong style={{ fontSize: '1.5rem', color: '#155724' }}>
                    {formatDateTime(session.start_time)}
                  </Text>
                  {session.end_time && (
                    <div>
                      <Text style={{ fontSize: '1.35rem', color: '#28a745' }}>
                        đến {formatDateTime(session.end_time)}
                      </Text>
                    </div>
                  )}
                </div>
              </Space>
            </div>
          </Col>
          
          <Col lg={6} md={12} xs={24}>
            <div style={{
              padding: '1.2rem',
              background: '#ffffff',
              borderRadius: '8px',
              borderLeft: '3px solid #d4edda',
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Space direction="vertical" size="small">
                <Text style={{ 
                  fontSize: '1.35rem', 
                  color: '#28a745', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <ThunderboltOutlined /> Năng lượng
                </Text>
                <Text strong style={{ fontSize: '1.6rem', color: '#155724', fontWeight: 700 }}>
                  {session.kwh || 0} kWh
                </Text>
              </Space>
            </div>
          </Col>
          
          <Col lg={6} md={12} xs={24}>
            <div style={{
              padding: '1.2rem',
              background: '#ffffff',
              borderRadius: '8px',
              borderLeft: '3px solid #d4edda',
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Space direction="vertical" size="small">
                <Text style={{ 
                  fontSize: '1.35rem', 
                  color: '#28a745', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <DollarOutlined /> Chi phí
                </Text>
                <Text strong style={{ fontSize: '1.6rem', color: '#155724', fontWeight: 700 }}>
                  {formatCurrency(session.total_amount || 0)}
                </Text>
              </Space>
            </div>
          </Col>
          
          <Col lg={6} md={12} xs={24}>
            <div style={{
              padding: '1.2rem',
              background: '#ffffff',
              borderRadius: '8px',
              borderLeft: '3px solid #d4edda',
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Space direction="vertical" size="small">
                <Text style={{ 
                  fontSize: '1.35rem', 
                  color: '#28a745', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <ApiOutlined /> Loại cắm
                </Text>
                <Text style={{ fontSize: '1.5rem', color: '#155724', fontWeight: 600 }}>
                  {session.plugType || session.charging_type || 'N/A'}
                </Text>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Expanded Detail */}
      {isExpanded && (
        <div style={{ 
          borderTop: '1px solid #d4edda',
          background: '#f8fffe'
        }}>
          <HistorySessionDetail session={session} />
        </div>
      )}
    </Card>
  );
};

export default HistorySessionCard;
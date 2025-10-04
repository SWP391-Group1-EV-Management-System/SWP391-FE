import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Button, Table, Tag, Space, Modal, message, Card, Statistic, 
  Badge, Typography, Tooltip, Row, Col, Input, List
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, 
  DeleteOutlined, ReloadOutlined, SearchOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckOutlined,
  DollarOutlined, UserOutlined, InfoCircleOutlined,
  WifiOutlined, DisconnectOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

// Constants
const SESSION_STATUS = {
  CHARGING: 'charging',
  COMPLETED: 'completed',
  INACTIVE: 'inactive'
};

const STATUS_CONFIG = {
  [SESSION_STATUS.CHARGING]: { color: 'processing', text: 'Đang sạc' },
  [SESSION_STATUS.COMPLETED]: { color: 'success', text: 'Hoàn thành' },
  [SESSION_STATUS.INACTIVE]: { color: 'default', text: 'Không hoạt động' }
};

const WaitingStaffPage = () => {
  const [chargingSessions, setChargingSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Updated stats data - bỏ growth
  const statsData = useMemo(() => [
    { 
      title: 'Tổng số trụ online', 
      value: 12, 
      icon: <WifiOutlined style={{ fontSize: '32px', color: '#6c757d' }} />, 
      color: '#43e97b'
    },
    { 
      title: 'Đang sạc', 
      value: 3, 
      icon: <ClockCircleOutlined style={{ fontSize: '32px', color: '#6c757d' }} />, 
      color: '#43e97b'
    },
    { 
      title: 'Trống', 
      value: 9, 
      icon: <CheckOutlined style={{ fontSize: '32px', color: '#6c757d' }} />, 
      color: '#43e97b'
    },
    { 
      title: 'Số trụ đang offline', 
      value: 2, 
      icon: <DisconnectOutlined style={{ fontSize: '32px', color: '#6c757d' }} />, 
      color: '#43e97b'
    }
  ], []);

  // Mock data cho queue
  const [queueData, setQueueData] = useState([
    {
      id: 1,
      stationId: 'POST001 (22kW)',
      sessionId: 'SDT: 0781130254',
      waitTime: 'Chờ từ: 21:38:27',
      estimatedTime: 'Thời gian chờ dự kiến: ~15 phút',
      queueCount: 0,
      currentUser: 'Tài xế 21'
    },
    {
      id: 2,
      stationId: 'POST005 (75kW)',
      sessionId: 'SDT: 0283216665',
      waitTime: 'Chờ từ: 21:38:27',
      estimatedTime: 'Thời gian chờ dự kiến: ~15 phút',
      queueCount: 0,
      currentUser: 'Tài xế 55'
    },
    {
      id: 3,
      stationId: 'POST051',
      sessionId: 'SDT: 0503997182',
      waitTime: 'Chờ từ: 21:38:27',
      estimatedTime: 'Thời gian chờ dự kiến: ~30 phút',
      queueCount: 2,
      currentUser: 'Tài xế 51'
    },
    {
      id: 4,
      stationId: 'POST031',
      sessionId: 'SDT: 0307540975',
      waitTime: 'Chờ từ: 21:38:27',
      estimatedTime: 'Thời gian chờ dự kiến: ~45 phút',
      queueCount: 3,
      currentUser: 'Tài xế 31'
    }
  ]);

  // Handle queue actions
  const handleQueueAction = useCallback((action, record) => {
    const actions = {
      info: () => {
        Modal.info({
          title: `Thông tin chi tiết - ${record.stationId}`,
          content: (
            <div>
              <p><strong>Tài xế:</strong> {record.currentUser}</p>
              <p><strong>SĐT:</strong> {record.sessionId}</p>
              <p><strong>Thời gian chờ:</strong> {record.waitTime}</p>
              <p><strong>Ước tính:</strong> {record.estimatedTime}</p>
              {record.queueCount > 0 && <p><strong>Số người đợi:</strong> {record.queueCount}</p>}
            </div>
          ),
          okText: 'Đóng'
        });
      },
      activate: () => Modal.confirm({
        title: 'Kích hoạt phiên sạc',
        content: `Bạn có chắc chắn muốn kích hoạt phiên sạc cho ${record.currentUser} tại ${record.stationId}?`,
        okText: 'Kích hoạt',
        cancelText: 'Hủy',
        onOk: () => {
          message.success('Đã kích hoạt phiên sạc thành công!');
        }
      }),
      cancel: () => Modal.confirm({
        title: 'Hủy hàng chờ',
        content: `Bạn có chắc chắn muốn hủy hàng chờ cho ${record.currentUser}?`,
        okText: 'Hủy hàng chờ',
        okType: 'danger',
        cancelText: 'Không',
        onOk: () => {
          setQueueData(prev => prev.filter(item => item.id !== record.id));
          message.success('Đã hủy hàng chờ thành công!');
        }
      })
    };
    actions[action]?.();
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã làm mới dữ liệu!');
    }, 1500);
  }, []);

  return (
    <div style={{ 
      padding: 24, 
      backgroundColor: '#ffffff', 
      minHeight: '100vh' 
    }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#262626', fontWeight: '600' }}>
            Hàng chờ
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Hệ thống quản lý trạm sạc xe điện thông minh, bền vững và thân thiện môi trường
          </Text>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={loading}
            size="large"
            style={{ 
              backgroundColor: '#43e97b', 
              borderColor: '#43e97b', 
              color: '#fff',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Hệ thống hoạt động tốt
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards - bỏ growth */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} lg={6} xl={6} key={index}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                height: '100%',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                padding: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ textAlign: 'center' }}>
                {/* Icon */}
                <div style={{ marginBottom: '16px' }}>
                  {stat.icon}
                </div>
                
                {/* Title */}
                <Text 
                  style={{ 
                    color: '#8c8c8c', 
                    fontSize: '14px',
                    fontWeight: '400',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  {stat.title}
                </Text>
                
                {/* Value - bỏ marginBottom */}
                <Title 
                  level={2} 
                  style={{ 
                    color: '#262626',
                    fontWeight: '600',
                    fontSize: '36px',
                    margin: '0',
                    lineHeight: '1'
                  }}
                >
                  {stat.value}
                </Title>
                
                {/* Bỏ phần Growth */}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card 
        title={
          <span style={{ 
            color: '#262626', 
            fontWeight: '600',
            fontSize: '18px'
          }}>
            Danh sách hàng chờ
          </span>
        }
        style={{ 
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <List
          dataSource={queueData}
          renderItem={(item) => (
            <List.Item style={{ 
              padding: '20px 24px', 
              border: '1px solid #f0f0f0',
              borderRadius: '12px',
              marginBottom: '16px',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ width: '100%' }}>
                <Row justify="space-between" align="middle">
                  <Col span={16}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Text strong style={{ 
                          color: '#262626', 
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {item.stationId}
                        </Text>
                        {item.queueCount > 0 && (
                          <Badge count={item.queueCount} color="#ff7a45" size="small">
                            <Tag color="orange" style={{ borderRadius: '6px' }}>
                              Người đợi
                            </Tag>
                          </Badge>
                        )}
                      </Space>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>
                        <UserOutlined style={{ marginRight: '8px' }} /> 
                        {item.currentUser}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {item.sessionId}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {item.waitTime}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {item.estimatedTime}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Tooltip title="Thông tin chi tiết">
                        <Button 
                          size="middle" 
                          icon={<InfoCircleOutlined />} 
                          onClick={() => handleQueueAction('info', item)}
                          style={{ borderRadius: '8px' }}
                        />
                      </Tooltip>
                      <Tooltip title="Kích hoạt">
                        <Button 
                          size="middle" 
                          type="primary"
                          style={{ 
                            backgroundColor: '#43e97b', 
                            borderColor: '#43e97b',
                            borderRadius: '8px'
                          }}
                          icon={<PlayCircleOutlined />} 
                          onClick={() => handleQueueAction('activate', item)}
                        />
                      </Tooltip>
                      <Tooltip title="Hủy">
                        <Button 
                          size="middle" 
                          danger
                          icon={<DeleteOutlined />} 
                          onClick={() => handleQueueAction('cancel', item)}
                          style={{ borderRadius: '8px' }}
                        />
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default WaitingStaffPage;
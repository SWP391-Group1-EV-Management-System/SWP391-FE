import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Button, Table, Tag, Space, Modal, message, Card, Statistic, 
  Badge, Typography, Tooltip, Row, Col, Input
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, 
  DeleteOutlined, ReloadOutlined, SearchOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

// Constants cho tree-shaking tối ưu trong Vite
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

const SessionStaffPage = () => {
  const [chargingSessions, setChargingSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Memoized stats data với màu chính #43e97b
  const statsData = useMemo(() => [
    { 
      title: 'Tổng phiên sạc', 
      value: 14, 
      icon: <ThunderboltOutlined />, 
      color: '#43e97b' 
    },
    { 
      title: 'Đang sạc', 
      value: 3, 
      icon: <ClockCircleOutlined />, 
      color: '#43e97b' 
    },
    { 
      title: 'Hoàn thành', 
      value: 11, 
      icon: <CheckOutlined />, 
      color: '#43e97b' 
    },
    { 
      title: 'Tổng doanh thu', 
      value: 1936350, 
      formatter: 'currency', 
      icon: <DollarOutlined />, 
      color: '#43e97b' 
    }
  ], []);

  // Search handler
  const handleSearch = useCallback((value) => {
    setSearchText(value);
    if (!value) {
      setFilteredSessions(chargingSessions);
    } else {
      const filtered = chargingSessions.filter(session => 
        session.sessionId.toLowerCase().includes(value.toLowerCase()) ||
        session.userDriver.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  }, [chargingSessions]);

  // Optimized action handler
  const handleAction = useCallback((action, record) => {
    const actions = {
      start: () => Modal.confirm({
        title: 'Khởi động phiên sạc',
        content: `Bạn có chắc chắn muốn khởi động phiên sạc ${record.sessionId}?`,
        okText: 'Khởi động',
        cancelText: 'Hủy',
        onOk: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            message.success('Đã khởi động phiên sạc thành công!');
          }, 1000);
        }
      }),
      stop: () => Modal.confirm({
        title: 'Dừng phiên sạc',
        content: `Bạn có chắc chắn muốn dừng phiên sạc ${record.sessionId}?`,
        okText: 'Dừng',
        cancelText: 'Hủy',
        onOk: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            message.success('Đã dừng phiên sạc thành công!');
          }, 1000);
        }
      }),
      payment: () => Modal.confirm({
        title: 'Xác nhận thanh toán',
        content: `Xác nhận thanh toán ${record.totalAmount.toLocaleString()} VND cho phiên sạc ${record.sessionId}?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            message.success('Đã xác nhận thanh toán thành công!');
          }, 1000);
        }
      }),
      delete: () => Modal.confirm({
        title: 'Xóa phiên sạc',
        content: `Bạn có chắc chắn muốn xóa phiên sạc ${record.sessionId}? Hành động này không thể hoàn tác.`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: () => {
          const updatedSessions = chargingSessions.filter(session => session.key !== record.key);
          setChargingSessions(updatedSessions);
          setFilteredSessions(updatedSessions);
          message.success('Đã xóa phiên sạc thành công!');
        }
      })
    };
    actions[action]?.();
  }, [chargingSessions]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã làm mới dữ liệu!');
    }, 1500);
  }, []);

  // Memoized table columns với màu sắc mới
  const columns = useMemo(() => [
    {
      title: 'Mã phiên',
      dataIndex: 'sessionId',
      key: 'sessionId',
      fixed: 'left',
      width: 120,
      render: (text) => (
        <Typography.Text strong style={{ color: '#43e97b' }}>
          {text}
        </Typography.Text>
      )
    },
    {
      title: 'User Driver',
      dataIndex: 'userDriver',
      key: 'userDriver',
      width: 150,
      render: (text) => (
        <Space>
          <span>👤</span>
          <Typography.Text style={{ color: '#000' }}>{text}</Typography.Text>
        </Space>
      )
    },
    {
      title: 'Trụ',
      dataIndex: 'post',
      key: 'post',
      width: 150,
      render: (text) => <Tag color="green">{text}</Tag>
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text) => (
        <Typography.Text style={{ color: '#000' }}>{text}</Typography.Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Đang sạc', value: SESSION_STATUS.CHARGING },
        { text: 'Hoàn thành', value: SESSION_STATUS.COMPLETED },
        { text: 'Không hoạt động', value: SESSION_STATUS.INACTIVE }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = STATUS_CONFIG[status];
        return <Badge status={config?.color} text={config?.text} />;
      }
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (time) => (
        <Space>
          <span>🕐</span>
          <Typography.Text style={{ color: '#000' }}>{time}</Typography.Text>
        </Space>
      )
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (time) => (
        <Space>
          <span>🕐</span>
          <Typography.Text style={{ color: '#000' }}>
            {time || <span style={{ color: '#999' }}>--:--</span>}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: 'KWh',
      dataIndex: 'kwh',
      key: 'kwh',
      width: 100,
      sorter: (a, b) => a.kwh - b.kwh,
      render: (kwh) => (
        <Statistic 
          value={kwh} 
          suffix="kWh" 
          valueStyle={{ fontSize: '14px', color: '#43e97b', fontWeight: 'bold' }}
          precision={2}
        />
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => (
        <Statistic 
          value={amount} 
          suffix="VND" 
          valueStyle={{ fontSize: '14px', color: '#43e97b', fontWeight: 'bold' }}
          formatter={(value) => value.toLocaleString()}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          {record.status === SESSION_STATUS.CHARGING ? (
            <Tooltip title="Dừng phiên sạc">
              <Button 
                size="small" 
                danger
                icon={<PauseCircleOutlined />} 
                onClick={() => handleAction('stop', record)} 
              />
            </Tooltip>
          ) : (
            <Tooltip title="Khởi động phiên sạc">
              <Button 
                size="small" 
                style={{ backgroundColor: '#43e97b', borderColor: '#43e97b', color: '#fff' }}
                icon={<PlayCircleOutlined />} 
                onClick={() => handleAction('start', record)} 
              />
            </Tooltip>
          )}
          
          <Tooltip title="Xác nhận thanh toán">
            <Button 
              size="small" 
              style={{ backgroundColor: '#43e97b', borderColor: '#43e97b', color: '#fff' }}
              icon={<CheckCircleOutlined />} 
              onClick={() => handleAction('payment', record)}
              disabled={record.status === SESSION_STATUS.CHARGING}
            />
          </Tooltip>
          
          <Tooltip title="Xóa phiên sạc">
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleAction('delete', record)} 
            />
          </Tooltip>
        </Space>
      )
    }
  ], [handleAction]);

  // Load mock data với format mới
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = [
        {
          key: 1,
          sessionId: 'CS001',
          userDriver: 'Nguyen Van A',
          post: 'POST001 (22kW)',
          date: '28/9/2025',
          status: SESSION_STATUS.COMPLETED,
          startTime: '10:00:00',
          endTime: '10:30:28',
          kwh: 12.50,
          totalAmount: 43750
        },
        {
          key: 2,
          sessionId: 'CS002',
          userDriver: 'Tran Thi B',
          post: 'POST002 (50kW)',
          date: '27/9/2025',
          status: SESSION_STATUS.COMPLETED,
          startTime: '14:30:00',
          endTime: '15:30:00',
          kwh: 20.00,
          totalAmount: 100000
        },
        {
          key: 3,
          sessionId: 'CS003',
          userDriver: 'Phan Van C',
          post: 'POST003 (100kW)',
          date: '26/9/2025',
          status: SESSION_STATUS.CHARGING,
          startTime: '09:15:00',
          endTime: null,
          kwh: 30.00,
          totalAmount: 180000
        },
        {
          key: 4,
          sessionId: 'CS004',
          userDriver: 'Nguyen Van A',
          post: 'POST004 (150kW)',
          date: '25/9/2025',
          status: SESSION_STATUS.COMPLETED,
          startTime: '16:20:00',
          endTime: '17:45:00',
          kwh: 25.00,
          totalAmount: 87500
        }
      ];
      setChargingSessions(mockData);
      setFilteredSessions(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Update filtered sessions when search changes
  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

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
            Quản lý phiên sạc & trạm
          </Title>
          <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
            Hệ thống quản lý trạm sạc xe điện thông minh, bền vững và thân thiện môi trường
          </Typography.Text>
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

      {/* Statistics Cards với phong cách mới */}
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
                  <span style={{ fontSize: '32px', color: '#6c757d' }}>
                    {stat.icon}
                  </span>
                </div>
                
                {/* Title */}
                <Typography.Text 
                  style={{ 
                    color: '#8c8c8c', 
                    fontSize: '14px',
                    fontWeight: '400',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  {stat.title}
                </Typography.Text>
                
                {/* Value */}
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
                  {stat.formatter === 'currency' ? 
                    `${stat.value?.toLocaleString()} VND` : stat.value}
                </Title>
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
            Danh sách phiên sạc
          </span>
        }
        style={{ 
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
        bodyStyle={{ padding: '24px' }}
        extra={
          <Space>
            <Badge count={3} color="orange" size="small">
              <Tag color="orange" style={{ borderRadius: '6px' }}>Đang sạc</Tag>
            </Badge>
            <Badge count={11} color="green" size="small">
              <Tag color="green" style={{ borderRadius: '6px' }}>Hoàn thành</Tag>
            </Badge>
          </Space>
        }
      >
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm theo mã phiên sạc hoặc tên người dùng..."
            allowClear
            enterButton={
              <Button style={{ 
                backgroundColor: '#43e97b', 
                borderColor: '#43e97b',
                borderRadius: '8px'
              }}>
                <SearchOutlined />
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ 
              maxWidth: 400,
              borderRadius: '8px'
            }}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredSessions}
          loading={loading}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} phiên sạc`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1300 }}
          bordered
          style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '8px'
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>
    </div>
  );
};

export default SessionStaffPage;
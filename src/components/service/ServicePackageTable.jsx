import React from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Popconfirm, 
  Typography,
  Card,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import PageHeader from '../PageHeader';

const { Title, Text } = Typography;

/**
 * Component hiển thị bảng quản lý gói dịch vụ cho Admin
 * Sử dụng Ant Design Table component
 */
const ServicePackageTable = ({ 
  packages = [], 
  loading = false,
  onEdit, 
  onDelete, 
  onAdd 
}) => {

  /**
   * Xử lý màu sắc cho loại gói
   */
  const getTypeTagColor = (type) => {
    switch (type) {
      case 'VIP':
        return 'gold';
      case 'Prepaid':
        return 'blue';
      case 'Postpaid':
        return 'green';
      default:
        return 'default';
    }
  };

  /**
   * Định nghĩa các cột cho bảng
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id) => (
        <Text code style={{ fontSize: '12px' }}>
          #{id}
        </Text>
      )
    },
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name) => (
        <Text strong style={{ color: '#262626' }}>
          {name}
        </Text>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          <Text type="secondary">
            {description}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Loại gói',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={getTypeTagColor(type)} style={{ fontWeight: 600 }}>
          {type}
        </Tag>
      ),
      filters: [
        { text: 'VIP', value: 'VIP' },
        { text: 'Prepaid', value: 'Prepaid' },
        { text: 'Postpaid', value: 'Postpaid' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'right',
      render: (price) => (
        <Text strong style={{ color: '#1890ff' }}>
          {price.toLocaleString('vi-VN')}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Thời hạn',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => (
        <Text>{duration}</Text>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              size="small"
              onClick={() => console.log('View:', record)}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa gói "${record.name}"?`}
            onConfirm={() => onDelete?.(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* Header */}
      <PageHeader
        title="Quản lý gói dịch vụ"
        subtitle={`Tổng số: ${packages.length} gói dịch vụ`}
        actionButton={{
          icon: <PlusOutlined />,
          text: 'Thêm gói mới',
          onClick: onAdd
        }}
      />

      {/* Bảng */}
      <Table
        columns={columns}
        dataSource={packages}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} gói`,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        scroll={{ x: 800 }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <Title level={4} type="secondary">
                Chưa có gói dịch vụ nào
              </Title>
              <Text type="secondary">
                Nhấn "Thêm gói mới" để tạo gói dịch vụ đầu tiên
              </Text>
            </div>
          )
        }}
        size="middle"
        bordered={false}
        style={{ 
          backgroundColor: '#fafafa',
          borderRadius: '8px'
        }}
      />
    </Card>
  );
};

export default ServicePackageTable;
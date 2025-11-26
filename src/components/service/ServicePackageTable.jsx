import React, { useState } from 'react';
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
  EyeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import PageHeader from '../PageHeader';

const { Title, Text } = Typography;

// Cắt ngắn văn bản dài
const truncate = (text = '', length = 120) => text.length > length ? text.slice(0, length) + '...' : text;

// Lấy ID duy nhất cho mỗi gói
const getId = (r) => r?.packageId ?? r?.id ?? r?._id ?? `${r?.packageName || 'pkg'}-${r?.price ?? 0}-${r?.billingCycle ?? 0}`;

const ServicePackageTable = ({
  packages = [],
  loading = false,
  onEdit,
  onAdd,
  onDelete,
  onView
}) => {
  const [hovered, setHovered] = useState(false);

  // Xử lý xóa gói dịch vụ
  const handleDelete = async (packageId) => {
    // delegate deletion to parent
    try {
      await onDelete?.(packageId);
    } catch (err) {
      // parent handles notifications; nothing else here
    }
  };

  const columns = [
    {
      title: 'Tên gói',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (name) => (
        <Text strong style={{ color: '#061b12' }}>{name}</Text>
      ),
    },
    {
      title: 'Chu kỳ (tháng)',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: 120,
      render: (c) => <Text>{c} tháng</Text>,
      sorter: (a, b) => (a.billingCycle || 0) - (b.billingCycle || 0),
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      align: 'right',
      render: (price) => (
        <Text strong style={{ color: '#0b6b3d' }}>{Number(price || 0).toLocaleString('vi-VN')}</Text>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Dung lượng (kWh)',
      dataIndex: 'quota',
      key: 'quota',
      width: 120,
      align: 'center',
      render: (q) => <Text>{q}</Text>
    },
    {
      title: 'Mô tả ngắn',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (d) => (
        <Tooltip title={d} placement="topLeft">
          <Text type="secondary">{truncate(d, 120)}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {/* Nút xem chi tiết */}
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView?.(record)}
            />
          </Tooltip>

          {/* Nút chỉnh sửa */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>

          {/* Nút xóa với xác nhận */}
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa gói "${record.packageName}"?`}
            onConfirm={() => handleDelete(record.packageId)}
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transition: 'box-shadow 0.2s ease, transform 0.12s ease' }}
    >
      <Card
        style={{
          borderRadius: 10,
          background: '#ffffff',
          boxShadow: hovered ? '0 6px 18px rgba(6, 27, 18, 0.12)' : '0 2px 6px rgba(6, 27, 18, 0.06)'
        }}
        styles={{ body: { padding: 16 } }}
      >
        <PageHeader
          title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ThunderboltOutlined style={{ color: '#0b6b3d' }} /> Quản lý gói dịch vụ</span>}
          subtitle={`Tổng số: ${packages.length} gói`}
          actionButton={{
            icon: <PlusOutlined />,
            text: 'Thêm gói mới',
            onClick: onAdd
          }}
        />

        <Table
          columns={columns}
          dataSource={Array.isArray(packages) ? packages.map(p => ({ ...p, packageId: getId(p) })) : []}
          rowKey={(record) => getId(record)}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} gói`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔋</div>
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
            backgroundColor: '#fbfdfb',
            borderRadius: '8px'
          }}
        />
      </Card>
    </div>
  );
};

export default ServicePackageTable;
import { Table, Button, Space, Popconfirm, Tag, Typography, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ReputationTable = ({ data, loading, onView, onEdit, onDelete }) => {
  const columns = [
    {
      title: 'Level ID',
      dataIndex: 'levelId',
      key: 'levelId',
      width: 100,
      sorter: (a, b) => a.levelId - b.levelId,
      render: (id) => <Text strong style={{ color: '#061b12' }}>{id}</Text>,
    },
    {
      title: 'Tên mức',
      dataIndex: 'levelName',
      key: 'levelName',
      render: (text) => <Text strong style={{ color: '#061b12' }}>{text}</Text>,
    },
    {
      title: 'Điểm tối thiểu',
      dataIndex: 'minScore',
      key: 'minScore',
      width: 150,
      sorter: (a, b) => a.minScore - b.minScore,
      render: (score) => (
        <Tag color="blue">{score}</Tag>
      ),
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 150,
      sorter: (a, b) => a.maxScore - b.maxScore,
      render: (score) => (
        <Tag color="green">{score}</Tag>
      ),
    },
    {
      title: 'Thời gian chờ tối đa (phút)',
      dataIndex: 'maxWaitMinutes',
      key: 'maxWaitMinutes',
      width: 200,
      sorter: (a, b) => a.maxWaitMinutes - b.maxWaitMinutes,
      render: (minutes) => (
        <Tag color="orange">{minutes} phút</Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (d) => (
        <Tooltip title={d} placement="topLeft">
          <Text type="secondary">{d}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa mức "${record.levelName}"?`}
            onConfirm={() => onDelete(record.levelId)}
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
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="levelId"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mức`,
        pageSizeOptions: ['5', '10', '20', '50'],
      }}
      scroll={{ x: 1200 }}
      locale={{
        emptyText: (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <Title level={4} type="secondary">
              Chưa có mức uy tín nào
            </Title>
            <Text type="secondary">
              Nhấn "Thêm mức mới" để tạo mức uy tín đầu tiên
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
  );
};

export default ReputationTable;
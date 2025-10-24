import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
import useUser from '../../hooks/useUser';
import { deleteUser } from '../../services/userService';

const DriverTable = ({ search }) => {
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });
  const { users, loading, error, refresh } = useUser('Driver');

  const data = (users || []).filter(
    u =>
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(search?.toLowerCase() || '') ||
        u.email.toLowerCase().includes(search?.toLowerCase() || ''))
  );

  const handleDelete = async (id, name) => {
    try {
      await deleteUser(id);
      message.success(`Đã xóa người dùng "${name}"`);
      refresh();
    } catch (err) {
      console.error(err);
      message.error('Xóa người dùng thất bại');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 90 },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setModal({ visible: true, mode: 'view', user: record })}>View</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => setModal({ visible: true, mode: 'edit', user: record })}>Edit</Button>

          <Popconfirm
            title={`Bạn có chắc chắn muốn xóa ${record.firstName} ${record.lastName}?`}
            onConfirm={() => handleDelete(record.id, `${record.firstName} ${record.lastName}`)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        rowClassName={(r, i) => (i % 2 === 0 ? 'table-row-even' : 'table-row-odd')}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        loading={loading}
      />
      {modal.visible && (
        <UserModal
          visible={modal.visible}
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal({ ...modal, visible: false })}
          onSave={user => {
            // After saving, refresh list
            setModal({ ...modal, visible: false });
            refresh();
          }}
        />
      )}
      <style>{`
        .table-row-even { background: #f6fff4; }
        .table-row-odd { background: transparent; }
        .ant-table-tbody > tr:hover > td { background: #e6f7e6 !important; }
      `}</style>
    </>
  );
};

export default DriverTable;

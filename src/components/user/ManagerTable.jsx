import React, { useState } from 'react';
import { Table, Button, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
// import useUserManagement from '...'; // Kết nối hook khi có

const mockData = [
  { id: 11, firstName: 'Minh', lastName: 'Nguyen', email: 'minh.manager@example.com', gender: 'Male' },
  { id: 12, firstName: 'Lan', lastName: 'Tran', email: 'lan.manager@example.com', gender: 'Female' },
  { id: 13, firstName: 'Hieu', lastName: 'Pham', email: 'hieu.manager@example.com', gender: 'Male' },
  { id: 14, firstName: 'Mai', lastName: 'Le', email: 'mai.manager@example.com', gender: 'Female' },
  { id: 15, firstName: 'Tuan', lastName: 'Vo', email: 'tuan.manager@example.com', gender: 'Male' },
  { id: 16, firstName: 'Hoa', lastName: 'Bui', email: 'hoa.manager@example.com', gender: 'Female' },
];

const ManagerTable = ({ search }) => {
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });
  // const { users, onView, onEdit, onDelete } = useUserManagement('manager');
  const data = mockData.filter(
    u =>
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(search?.toLowerCase()) ||
        u.email.toLowerCase().includes(search?.toLowerCase()))
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 90 },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setModal({ visible: true, mode: 'view', user: record })}>View</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => setModal({ visible: true, mode: 'edit', user: record })}>Edit</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => {/* onDelete(record.id) */}}>Delete</Button>
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
      />
      {modal.visible && (
        <UserModal
          visible={modal.visible}
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal({ ...modal, visible: false })}
          onSave={user => {
            // onEdit(user)
            setModal({ ...modal, visible: false });
          }}
        />
      )}
      <style>{`
        .table-row-even { background: #f6fff4; }
        .table-row-odd { background: #fff; }
        .ant-table-tbody > tr:hover > td { background: #e6f7e6 !important; }
      `}</style>
    </>
  );
};

export default ManagerTable;

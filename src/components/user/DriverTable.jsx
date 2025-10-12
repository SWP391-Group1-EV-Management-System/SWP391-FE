import React, { useState } from 'react';
import { Table, Button, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
// import useUserManagement from '...'; // Kết nối hook khi có

const mockData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', gender: 'Male' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', gender: 'Female' },
  { id: 3, firstName: 'Alex', lastName: 'Brown', email: 'alex@example.com', gender: 'Male' },
  { id: 4, firstName: 'Emily', lastName: 'White', email: 'emily@example.com', gender: 'Female' },
  { id: 5, firstName: 'Chris', lastName: 'Green', email: 'chris@example.com', gender: 'Male' },
  { id: 6, firstName: 'Anna', lastName: 'Black', email: 'anna@example.com', gender: 'Female' },
];

const DriverTable = ({ search }) => {
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });
  // const { users, onView, onEdit, onDelete } = useUserManagement('driver');
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
        .table-row-odd { background: transparent; }
        .ant-table-tbody > tr:hover > td { background: #e6f7e6 !important; }
      `}</style>
    </>
  );
};

export default DriverTable;

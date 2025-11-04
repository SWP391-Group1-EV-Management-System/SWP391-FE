import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useUsers } from '../hooks/useUsers';
import { userService } from '../../services/userService';
import UserModal from './UserModal';

const UserList = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { users, loading } = useUsers(refreshKey);
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });

  // Refresh user list after CRUD
  const refreshUsers = () => setRefreshKey(k => k + 1);

  // Thêm user
  const handleAdd = () => setModal({ visible: true, mode: 'add', user: {} });

  // Sửa user
  const handleEdit = (user) => setModal({ visible: true, mode: 'edit', user });

  // Xem chi tiết user
  const handleView = (user) => setModal({ visible: true, mode: 'view', user });

  // Xóa user
  const handleDelete = async (userID) => {
    await userService.deleteUser(userID);
    message.success('Đã xóa user thành công!');
    refreshUsers();
  };

  // Lưu user (thêm/sửa)
  const handleSave = async (userData) => {
    if (modal.mode === 'add') {
      await userService.addUser(userData);
      message.success('Thêm user thành công!');
    } else if (modal.mode === 'edit') {
      await userService.updateUser(userData.id || userData.userID, userData);
      message.success('Cập nhật user thành công!');
    }
    setModal({ ...modal, visible: false });
    refreshUsers();
  };
  
  // Chuẩn hóa dữ liệu user từ API
  const mapUser = (u) => ({
    id: u.user_id || u.id,
    firstName: u.first_name || '',
    lastName: u.last_name || '',
    email: u.email || '',
    phone: u.phone_number || u.phone || '',
    role: u.role === 'DRIVER' ? 'Driver' : u.role === 'MANAGER' ? 'Manager' : u.role === 'STAFF' ? 'Staff' : u.role,
    status: u.status === true ? 'Active' : 'Inactive',
    gender: u.gender === true ? 'Male' : u.gender === false ? 'Female' : '',
  });

  // Cột bảng
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName || ''} ${r.lastName || ''}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Role', dataIndex: 'role', key: 'role', width: 100 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>Xem</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa user này?" onConfirm={() => handleDelete(record.id || record.userID)} okText="Xóa" cancelText="Hủy">
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: '#166534', fontWeight: 700 }}>Danh sách người dùng</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#166534' }} onClick={handleAdd}>
          Thêm người dùng
        </Button>
      </div>
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={users.map(mapUser)}
        loading={loading}
        pagination={{ pageSize: 8 }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      />
      {modal.visible && (
        <UserModal
          visible={modal.visible}
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal({ ...modal, visible: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UserList;

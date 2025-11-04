import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
import useUser from '../../hooks/useUser';
import { getUserById } from '../../services/userService';

const StaffTable = ({ search }) => {
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });
  const [loadingUser, setLoadingUser] = useState(false);
  const { users, loading, error, refresh, update, remove } = useUser('Staff');

  const data = (users || []).filter(
    u =>
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(search?.toLowerCase() || '') ||
        u.email.toLowerCase().includes(search?.toLowerCase() || ''))
  );

  const handleDelete = async (id, name) => {
    try {
      await remove(id);
      message.success(`Đã xóa người dùng "${name}"`);
      refresh();
    } catch (err) {
      console.error(err);
      message.error('Xóa người dùng thất bại');
    }
  };

  const handleViewEdit = async (record, mode) => {
    try {
      setLoadingUser(true);
      console.log('🟦 Fetching full user data for ID:', record.id);
      
      // Gọi API để lấy full user data kèm birthDate
      const fullUserData = await getUserById(record.id);
      console.log('🟦 Full user data from API:', fullUserData);
      console.log('🟦 birthDate from API:', fullUserData.birthDate);
      
      // Map lại user data đúng format
      const mappedUser = {
        id: fullUserData.id || record.id,
        firstName: fullUserData.firstName || record.firstName,
        lastName: fullUserData.lastName || record.lastName,
        email: fullUserData.email || record.email,
        gender: fullUserData.gender === true ? 'Male' : fullUserData.gender === false ? 'Female' : record.gender,
        phone: fullUserData.phone || fullUserData.phoneNumber || record.phone,
        role: (fullUserData.role || record.role || '').toLowerCase(),
        status: fullUserData.active === true || fullUserData.status === true ? 'Active' : 'Inactive',
        birthDate: fullUserData.birthDate || null, // ✅ Lấy birthDate từ API
        password: fullUserData.password || record.password || '',
        createdAt: fullUserData.createdAt || record.createdAt || '',
      };
      
      console.log('🟦 Mapped user with birthDate:', mappedUser);
      setModal({ visible: true, mode, user: mappedUser });
    } catch (err) {
      console.error('Error fetching user details:', err);
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoadingUser(false);
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
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewEdit(record, 'view')}
            loading={loadingUser}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleViewEdit(record, 'edit')}
            loading={loadingUser}
          >
            Edit
          </Button>

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
          onClose={() => setModal({ visible: false, mode: 'view', user: null })}
          onSave={() => {
            setModal({ visible: false, mode: 'view', user: null });
          }}
          onUpdate={update}
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

export default StaffTable;

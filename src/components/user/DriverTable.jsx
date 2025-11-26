import React, { useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
import useUser from '../../hooks/useUser';
import { getUserById } from '../../services/userService';

const DriverTable = ({ search }) => {
  const [modal, setModal] = useState({ visible: false, mode: 'view', user: null });
  const [loadingUser, setLoadingUser] = useState(false);
  const { users, loading, refresh, update } = useUser('Driver');

  const data = (users || []).filter(
    u =>
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(search?.toLowerCase() || '') ||
        u.email.toLowerCase().includes(search?.toLowerCase() || ''))
  );

  const handleViewEdit = async (record, mode) => {
    try {
      setLoadingUser(true);
      
      // Gọi API để lấy full user data kèm birthDate
      const fullUserData = await getUserById(record.id);
      
      // Map lại user data đúng format
      const mappedUser = {
        id: fullUserData?.id || record.id,
        firstName: fullUserData?.firstName || record.firstName,
        lastName: fullUserData?.lastName || record.lastName,
        email: fullUserData?.email || record.email,
        gender: fullUserData?.gender === true ? 'Male' : fullUserData?.gender === false ? 'Female' : record.gender,
        phone: fullUserData?.phone || fullUserData?.phoneNumber || record.phone,
        role: (fullUserData?.role || record.role || '').toLowerCase(),
        status: fullUserData?.active === true || fullUserData?.status === true ? 'Active' : 'Inactive',
        birthDate: fullUserData?.birthDate || null,
        password: fullUserData?.password || record.password || '',
        createdAt: fullUserData?.createdAt || record.createdAt || '',
      };
      
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
    { title: 'Họ & Tên', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: 90 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100 },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
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
        .table-row-odd { background: transparent; }
        .ant-table-tbody > tr:hover > td { background: #e6f7e6 !important; }
      `}</style>
    </>
  );
};

export default DriverTable;

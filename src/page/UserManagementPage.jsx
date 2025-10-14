import React, { useState } from 'react';
import { Tabs, Input, Button, Row, Col, Card, Space, Typography, message } from 'antd';
import DriverTable from '../components/user/DriverTable';
import ManagerTable from '../components/user/ManagerTable';
import StaffTable from '../components/user/StaffTable';
import PageHeader from '../components/PageHeader';
import ServicePackageForm from '../components/service/ServicePackageForm';
import ServicePackageTable from '../components/service/ServicePackageTable';
import ServicePackageManagement from '../components/service/ServicePackageManagement';
import { FaUserAlt } from "react-icons/fa";
import { GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import ReportList from '../components/ReportList';

const { Title, Paragraph } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// User CRUD API
const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/users/getAllUsers`);
    console.log('API users response:', res.data);
    return res.data;
  } catch {
    message.error('Không thể tải danh sách người dùng!');
    return [];
  }
};
const addUser = async (userData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/users`, userData);
    message.success('Thêm người dùng thành công!');
    return res.data;
  } catch {
    message.error('Thêm người dùng thất bại!');
    return null;
  }
};
const updateUser = async (userID, userData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/users/update/${userID}`, userData);
    message.success('Cập nhật người dùng thành công!');
    return res.data;
  } catch {
    message.error('Cập nhật người dùng thất bại!');
    return null;
  }
};
const deleteUser = async (userID) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/delete/${userID}`);
    message.success('Xóa người dùng thành công!');
    return true;
  } catch {
    message.error('Xóa người dùng thất bại!');
    return false;
  }
};

// Chuẩn hóa dữ liệu user từ API về UI
const mapUserFromApi = (apiUser) => ({
  id: apiUser.userID || apiUser.id,
  firstName: apiUser.firstName || '',
  lastName: apiUser.lastName || '',
  email: apiUser.email || '',
  gender: apiUser.gender === true ? 'Male' : apiUser.gender === false ? 'Female' : '',
  phone: apiUser.phoneNumber || apiUser.phone || '',
  role: (apiUser.role || '').toLowerCase() === 'driver' ? 'Driver' : (apiUser.role || '').toLowerCase() === 'manager' ? 'Manager' : (apiUser.role || '').toLowerCase() === 'staff' ? 'Staff' : apiUser.role,
  status: apiUser.status === true ? 'Active' : 'Inactive',
  birthDate: apiUser.birthDate || '',
  createdAt: apiUser.createdAt || '',
  password: apiUser.password || '',
});

const UserManagementPage = () => {
  // User search
  const [search, setSearch] = useState('');
  const handleSearch = (e) => setSearch(e.target.value);

  // User data state
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Fetch users on mount
  React.useEffect(() => {
    setUserLoading(true);
    fetchUsers().then(data => {
      setUsers(Array.isArray(data) ? data.map(mapUserFromApi) : []);
      setUserLoading(false);
    });
  }, []);

  // User CRUD handlers
  const handleAddUser = async (userData) => {
    setUserLoading(true);
    await addUser(userData);
    const data = await fetchUsers();
    setUsers(Array.isArray(data) ? data.map(mapUserFromApi) : []);
    setUserLoading(false);
  };
  const handleEditUser = async (userID, userData) => {
    setUserLoading(true);
    await updateUser(userID, userData);
    const data = await fetchUsers();
    setUsers(Array.isArray(data) ? data.map(mapUserFromApi) : []);
    setUserLoading(false);
  };
  const handleDeleteUser = async (userID) => {
    setUserLoading(true);
    await deleteUser(userID);
    const data = await fetchUsers();
    setUsers(Array.isArray(data) ? data.map(mapUserFromApi) : []);
    setUserLoading(false);
  };

  // Service package state
  const [packages, setPackages] = useState([
    { id: 1, name: "Basic Plan", description: "Gói cơ bản cho người dùng mới, phù hợp sử dụng hàng ngày với mức giá tiết kiệm", price: 100000, duration: "30 ngày", type: "Prepaid" },
    { id: 2, name: "Premium Plan", description: "Gói cao cấp cho người dùng thường xuyên, nhiều ưu đãi và dịch vụ hỗ trợ tốt nhất", price: 300000, duration: "90 ngày", type: "VIP" },
    { id: 3, name: "Enterprise Plan", description: "Gói dành cho doanh nghiệp với quota lớn và chính sách thanh toán linh hoạt", price: 1000000, duration: "365 ngày", type: "Postpaid" }
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [loading, setLoading] = useState(false);

  // Service package handlers
  const handleAddPackage = () => {
    setFormMode('add');
    setEditingPackage(null);
    setIsFormOpen(true);
  };
  const handleEditPackage = (packageData) => {
    setFormMode('edit');
    setEditingPackage(packageData);
    setIsFormOpen(true);
  };
  const handleDeletePackage = (packageId) => {
    const packageToDelete = packages.find(pkg => pkg.id === packageId);
    setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
    message.success(`Đã xóa gói "${packageToDelete?.name}" thành công!`);
  };
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (formMode === 'edit') {
        setPackages(prev => prev.map(pkg => pkg.id === editingPackage.id ? { ...pkg, ...formData } : pkg));
        message.success(`Cập nhật gói "${formData.name}" thành công!`);
      } else {
        const newPackage = { ...formData, id: Math.max(...packages.map(p => p.id), 0) + 1 };
        setPackages(prev => [...prev, newPackage]);
        message.success(`Thêm gói "${formData.name}" thành công!`);
      }
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  // Tabs for user and service package management
  const tabItems = [
    {
      key: 'user',
      label: <span className="tab-animate">Quản lý người dùng</span>,
      children: (
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ color: '#166534', fontWeight: 600 }}
          items={[
            { key: '1', label: <span className="tab-animate">Driver</span>, children: <DriverTable search={search} users={users} loading={userLoading} onAdd={handleAddUser} onEdit={handleEditUser} onDelete={handleDeleteUser} /> },
            { key: '2', label: <span className="tab-animate">Manager</span>, children: <ManagerTable search={search} users={users} loading={userLoading} onAdd={handleAddUser} onEdit={handleEditUser} onDelete={handleDeleteUser} /> },
            { key: '3', label: <span className="tab-animate">Staff</span>, children: <StaffTable search={search} users={users} loading={userLoading} onAdd={handleAddUser} onEdit={handleEditUser} onDelete={handleDeleteUser} /> },
          ]}
        />
      )
    },
    {
      key: 'service',
      label: <span className="tab-animate">Quản lý gói dịch vụ</span>,
      children: (
        <ServicePackageManagement />
      )
    },
    {
      key: 'report',
      label: <span className="tab-animate">Quản lý báo cáo</span>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <ReportList />
        </div>
      )
    }
  ];

  return (
    <div className="user-management-fadein" style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 500 }}>
      <PageHeader
        title={
          <span style={{
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '40px',
            fontWeight: 900,
            letterSpacing: '1px',
            transition: 'font-size 0.3s cubic-bezier(.4,2,.6,1)',
            display: 'inline-block',
          }}>
            <FaUserAlt style={{ marginRight: 8, color: '#10b981' }} /> Management Page
          </span>
        }
        customStyle={{ fontSize: '40px', fontWeight: 900, letterSpacing: '1px', level: 1 }}
      />
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={handleSearch}
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Col>
      </Row>
      <Tabs defaultActiveKey="user" items={tabItems} />
      <ServicePackageForm
        visible={isFormOpen}
        onCancel={handleFormCancel}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={editingPackage}
      />
    </div>
  );
};

export default UserManagementPage;
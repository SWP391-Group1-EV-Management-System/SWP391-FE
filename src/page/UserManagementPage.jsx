// Trang quản lý hệ thống (Admin) - quản lý user, gói dịch vụ và trạm sạc
import React, { useState } from 'react';
import { Tabs, Input, Row, Col } from 'antd';
import DriverTable from '../components/user/DriverTable';
import StaffTable from '../components/user/StaffTable';
import PageHeader from '../components/PageHeader';
import ServicePackageManagement from '../components/service/ServicePackageManagement';
import StationManagement from '../components/station/StationManagement';
import PostManagement from '../components/station/PostManagement';
import { FaUserAlt } from 'react-icons/fa';

const UserManagementPage = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('user');

  // Xử lý tìm kiếm người dùng
  const handleSearch = (e) => setSearch(e.target.value);

  // Xử lý chuyển đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Cấu hình các tab chính
  const tabItems = [
    {
      key: 'user',
      label: <span className="tab-animate">Quản lý người dùng</span>,
      children: (
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ color: '#166534', fontWeight: 600 }}
          items={[
            // Tab danh sách Driver
            { 
              key: '1', 
              label: <span className="tab-animate">Tài xế</span>, 
              children: <DriverTable search={search} /> 
            },
            // Tab danh sách Staff
            { 
              key: '2', 
              label: <span className="tab-animate">Nhân viên</span>, 
              children: <StaffTable search={search} /> 
            },
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
      key: 'station',
      label: <span className="tab-animate">Quản lý trạm</span>,
      children: (
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ color: '#166534', fontWeight: 600 }}
          items={[
            // Tab danh sách trạm
            { 
              key: '1', 
              label: <span className="tab-animate">Trạm</span>, 
              children: <StationManagement /> 
            },
            // Tab danh sách trụ sạc
            { 
              key: '2', 
              label: <span className="tab-animate">Trụ</span>, 
              children: <PostManagement /> 
            },
          ]}
        />
      )
    },
  ];

  return (
    <div className="user-management-fadein" style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 500 }}>
      {/* Header trang */}
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
            <FaUserAlt style={{ marginRight: 8, color: '#10b981' }} /> Quản lý
          </span>
        }
        customStyle={{ fontSize: '40px', fontWeight: 900, letterSpacing: '1px', level: 1 }}
      />

      {/* Thanh tìm kiếm - chỉ hiển thị khi đang ở tab user */}
      {activeTab === 'user' && (
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
      )}

      {/* Tabs điều hướng chính */}
      <Tabs 
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems} 
      />
    </div>
  );
};

export default UserManagementPage;
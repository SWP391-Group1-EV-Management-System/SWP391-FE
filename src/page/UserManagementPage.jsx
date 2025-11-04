import React, { useState } from 'react';
import { Tabs, Input, Row, Col } from 'antd';
import DriverTable from '../components/user/DriverTable';
import StaffTable from '../components/user/StaffTable';
import PageHeader from '../components/PageHeader';
import ServicePackageManagement from '../components/service/ServicePackageManagement';
import { FaUserAlt } from 'react-icons/fa';
import ReportList from '../components/ReportList';

const UserManagementPage = () => {
  const [search, setSearch] = useState('');
  const handleSearch = (e) => setSearch(e.target.value);

  const tabItems = [
    {
      key: 'user',
      label: <span className="tab-animate">Quản lý người dùng</span>,
      children: (
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ color: '#166534', fontWeight: 600 }}
          items={[
            { key: '1', label: <span className="tab-animate">Driver</span>, children: <DriverTable search={search} /> },
            { key: '2', label: <span className="tab-animate">Staff</span>, children: <StaffTable search={search} /> },
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
    </div>
  );
};

export default UserManagementPage;
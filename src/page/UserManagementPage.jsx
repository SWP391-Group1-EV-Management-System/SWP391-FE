import React, { useState } from 'react';
import { Tabs, Input } from 'antd';
import DriverTable from '../components/user/DriverTable';
import ManagerTable from '../components/user/ManagerTable';
import StaffTable from '../components/user/StaffTable';
import PageHeader from '../components/PageHeader';
import { FaUserAlt } from "react-icons/fa";

const UserManagementPage = () => {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div
      className="user-management-fadein"
      style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 500 }}
    >
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
            <FaUserAlt style={{ marginRight: 8, color: '#10b981' }} /> User Management
          </span>
        }
        customStyle={{ fontSize: '40px', fontWeight: 900, letterSpacing: '1px', level: 1 }}
      />
      <Input.Search
        className="user-search-animate"
        placeholder="Search by name or email"
        allowClear
        value={search}
        onChange={handleSearch}
        style={{ marginBottom: 24, maxWidth: 400 }}
      />
      <Tabs
        defaultActiveKey="1"
        tabBarStyle={{ color: '#166534', fontWeight: 600 }}
        items={[
          {
            key: '1',
            label: <span className="tab-animate">Driver</span>,
            children: <DriverTable search={search} />,
          },
          {
            key: '2',
            label: <span className="tab-animate">Manager</span>,
            children: <ManagerTable search={search} />,
          },
          {
            key: '3',
            label: <span className="tab-animate">Staff</span>,
            children: <StaffTable search={search} />,
          },
        ]}
      />
      <style>{`
        .user-management-fadein {
          animation: fadeInUp 0.7s cubic-bezier(.4,2,.6,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-search-animate:hover {
          box-shadow: 0 0 0 2px #10b98133;
          transition: box-shadow 0.3s;
        }
        .tab-animate {
          transition: color 0.3s, text-shadow 0.3s;
        }
        .tab-animate:hover {
          color: #10b981 !important;
          text-shadow: 0 2px 8px #10b98133;
        }
      `}</style>
    </div>
  );
};

export default UserManagementPage;

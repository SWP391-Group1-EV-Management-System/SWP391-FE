import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Spin, Input, Row, Col, Button } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import useCar from '../hooks/useCar';

// Map ID sang tên loại cổng sạc
const CHARGING_TYPE_NAMES = {
  1: 'CCS',
  2: 'CHAdeMO',
  3: 'AC',
  4: 'NACS',
};

const CarManagementPage = () => {
  // ==================== HOOKS ====================
  const { cars, loading, fetchAllCars } = useCar();

  // search state - gộp thành một
  const [searchText, setSearchText] = useState('');

  // ==================== LẤY TOÀN BỘ DANH SÁCH XE ====================
  useEffect(() => {
    fetchAllCars();
  }, [fetchAllCars]);

  // tìm kiếm theo cả biển số và số khung
  const filteredCars = useMemo(() => {
    if (!Array.isArray(cars)) return [];
    const search = (searchText || '').trim().toUpperCase();

    // Hàm sắp xếp: xe active lên đầu
    const sortActiveFirst = (a, b) => {
      if (a.active === b.active) return 0;
      return a.active ? -1 : 1;
    };

    // Hàm sắp xếp: xe active lên đầu
    if (!search) return [...cars].sort(sortActiveFirst);

    const filtered = cars.filter((c) => {
      const lp = (c.licensePlate || '').toString().toUpperCase();
      const ch = (c.chassisNumber || '').toString().toUpperCase();
      return lp.includes(search) || ch.includes(search);
    });

    // Trả về kết quả đã lọc và sắp xếp với xe active lên đầu
    return filtered.sort(sortActiveFirst);
  }, [cars, searchText]);

  // ==================== CỘT BẢNG ====================
  const columns = [
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: '15%',
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      width: '12%',
    },
    {
      title: 'Loại xe',
      dataIndex: 'typeCar',
      key: 'typeCar',
      width: '20%',
    },
    {
      title: 'Số khung',
      dataIndex: 'chassisNumber',
      key: 'chassisNumber',
      width: '18%',
    },
    {
      title: 'Loại cổng sạc',
      dataIndex: 'chargingType',
      key: 'chargingType',
      width: '13%',
      render: (chargingTypeId) => {
        const name = CHARGING_TYPE_NAMES[chargingTypeId] || 'N/A';
        return <Tag color="green">{name}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: '10%',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Hoạt động' : 'Ngưng'}
        </Tag>
      ),
    },
  ];

  // ==================== TRẠNG THÁI LOADING ====================
  if (loading && (!cars || cars.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // ==================== GIAO DIỆN CHÍNH ====================
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Quản lý xe (Admin)"
          icon={<CarOutlined />}
          subtitle="Quản lý toàn bộ danh sách xe điện trong hệ thống"
        />

        {/* Bảng danh sách xe */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Danh sách toàn bộ xe trong hệ thống
          </h2>

          {/* Search controls: một ô tìm kiếm chung */}
          <div className="mb-4">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={16} lg={12}>
                <Input.Search
                  placeholder="Tìm kiếm theo biển số hoặc số khung"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  enterButton
                  size="large"
                />
              </Col>
            </Row>
          </div>

          {!loading && (!cars || cars.length === 0) ? (
            <div className="text-gray-500 text-center py-12">
              Chưa có xe nào trong hệ thống.
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredCars}
              rowKey={(record) => record.carID || record.id}
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Tổng số ${total} xe`,
              }}
              loading={loading}
              scroll={{ x: 1200 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CarManagementPage;
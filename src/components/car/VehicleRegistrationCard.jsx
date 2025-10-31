import React from 'react';
import { Button, Table, Popconfirm, Tag } from 'antd';

// Map ID sang tên loại cổng sạc
const CHARGING_TYPE_NAMES = {
  1: 'CCS',
  2: 'CHAdeMO',
  3: 'AC',
};

const VehicleRegistrationCard = ({ vehicles = [], onEdit, onDelete, loading }) => {
  const columns = [
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Loại xe',
      dataIndex: 'typeCar',
      key: 'typeCar',
    },
    {
      title: 'Số khung',
      dataIndex: 'chassisNumber',
      key: 'chassisNumber',
    },
    {
      title: 'Loại cổng sạc',
      dataIndex: 'chargingType',
      key: 'chargingType',
      render: (chargingTypeId) => {
        const name = CHARGING_TYPE_NAMES[chargingTypeId] || 'N/A';
        return <Tag color="green">{name}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="space-x-2">
          <Button 
          type="primary" 
          onClick={() => onEdit(record)}
          style={{ backgroundColor: "#0b9459", color: "#fff" }}
          >
          Sửa
          </Button>
          <Popconfirm
            title="Xóa xe"
            description="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => onDelete(record.carID)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary"  style={{ backgroundColor: "#e60e11", color: "#fff" }}
            >Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách xe đã đăng ký</h2>
      {!loading && vehicles.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          Chưa có xe nào được đăng ký. Nhấn nút "Đăng ký xe" để thêm xe mới.
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={vehicles}
          rowKey={(record) => record.carID || record.id || record._id || record.licensePlate}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default VehicleRegistrationCard;
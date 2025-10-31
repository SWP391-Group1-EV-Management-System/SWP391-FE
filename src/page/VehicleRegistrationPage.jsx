import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { PlusOutlined, CarOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import VehicleRegistrationCard from '../components/car/VehicleRegistrationCard';
import VehicleRegistrationForm from '../components/car/VehicleRegistrationForm';
import useCar from '../hooks/useCar';
import { useAuth } from '../hooks/useAuth';

const VehicleRegistrationPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { cars, loading, fetchCarsByUser, createCar, modifyCar, removeCar } = useCar();
  const { user } = useAuth();

  const userId = user?.userId || user?.id || null;

  // Load danh sách xe khi component mount
  useEffect(() => {
    if (!userId) return;
    fetchCarsByUser(userId);
  }, [userId, fetchCarsByUser]);

  // Mở form tạo xe mới
  const handleOpenCreateForm = () => {
    setEditingCar(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // Mở form chỉnh sửa xe
  const handleEdit = (car) => {
    setEditingCar({
      carID: car.carID,
      licensePlate: car.licensePlate,
      typeCar: car.typeCar,
      chassisNumber: car.chassisNumber,
      chargingType: car.chargingType
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Xóa xe
  const handleDelete = async (carId) => {
    try {
      await removeCar(carId);
      message.success('Xóa xe thành công!');
      if (userId) fetchCarsByUser(userId);
    } catch (error) {
      message.error(error.response?.data || 'Xóa xe thất bại!');
    }
  };

  // Submit form (tạo mới hoặc cập nhật)
  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        licensePlate: values.licensePlate,
        user: userId,
        typeCar: values.typeCar,
        chassisNumber: values.chassisNumber,
        chargingType: values.chargingType,
      };

      if (isEditing && editingCar && editingCar.carID) {
        await modifyCar(editingCar.carID, payload);
        message.success('Cập nhật xe thành công!');
      } else {
        await createCar(payload);
        message.success('Đăng ký xe thành công!');
      }
      
      setIsFormOpen(false);
      setEditingCar(null);
      setIsEditing(false);
      
      if (userId) fetchCarsByUser(userId);
    } catch (error) {
      const errorMsg = error.response?.data || (isEditing ? 'Cập nhật xe thất bại!' : 'Đăng ký xe thất bại!');
      message.error(errorMsg);
    }
  };

  // Đóng form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCar(null);
    setIsEditing(false);
  };

  // Loading khi chưa có user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Loading khi đang fetch cars lần đầu
  if (loading && (!cars || cars.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Quản lý đăng ký xe"
          icon={<CarOutlined />}
          subtitle="Quản lý thông tin đăng ký xe điện của bạn"
          actionButton={{
            icon: <PlusOutlined />,
            style: { backgroundColor: "#0b9459", color: "#fff" },
            text: "Đăng ký xe",
            onClick: handleOpenCreateForm
          }}
        />

        <VehicleRegistrationCard 
          vehicles={cars || []}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <VehicleRegistrationForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialValues={editingCar}
        isEditing={isEditing}
      />
    </div>
  );
};

export default VehicleRegistrationPage;
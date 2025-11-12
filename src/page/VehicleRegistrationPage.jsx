import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { PlusOutlined, CarOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import VehicleRegistrationCard from '../components/car/VehicleRegistrationCard';
import VehicleRegistrationForm from '../components/car/VehicleRegistrationForm';
import useCar from '../hooks/useCar';
import { useAuth } from '../hooks/useAuth';

const VehicleRegistrationPage = () => {
  // ==================== STATE MANAGEMENT ====================
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // ==================== HOOKS ====================
  const { cars, loading, fetchCarsByUser, createCar, modifyCar, removeCar } = useCar();
  const { user } = useAuth();

  const userId = user?.userId || user?.id || null;

  // ==================== LẤY DANH SÁCH XE THEO USER ====================
  useEffect(() => {
    if (!userId) return;
    fetchCarsByUser(userId);
  }, [userId, fetchCarsByUser]);

  // ==================== MỞ FORM TẠO XE MỚI ====================
  const handleOpenCreateForm = () => {
    setEditingCar(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // ==================== MỞ FORM CHỈNH SỬA XE ====================
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

  // ==================== XÓA XE ====================
  const handleDelete = async (carId) => {
    try {
      await removeCar(carId);
      message.success('Xóa xe thành công!');
      if (userId) fetchCarsByUser(userId);
    } catch (error) {
      message.error(error.response?.data || 'Xóa xe thất bại!');
    }
  };

  // ==================== SUBMIT FORM (TẠO MỚI / CẬP NHẬT) ====================
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

  // ==================== ĐÓNG FORM ====================
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCar(null);
    setIsEditing(false);
  };

  // ==================== TRẠNG THÁI LOADING KHI CHƯA CÓ USER ====================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // ==================== TRẠNG THÁI LOADING KHI ĐANG FETCH DANH SÁCH XE ====================
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
      <div className="max-w-6xl mx-auto">
        {/* Header với nút đăng ký xe */}
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

        {/* Danh sách xe đã đăng ký */}
        <VehicleRegistrationCard 
          vehicles={cars || []}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Form tạo mới / chỉnh sửa xe */}
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
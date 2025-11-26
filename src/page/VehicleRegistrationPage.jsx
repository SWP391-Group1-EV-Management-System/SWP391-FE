// Trang đăng ký xe - quản lý danh sách xe điện của user
import React, { useState, useEffect } from 'react';
import { message, Spin, notification, Button } from 'antd';
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
  // Tải danh sách xe của user khi component mount
  useEffect(() => {
    if (!userId) return;
    fetchCarsByUser(userId);
  }, [userId, fetchCarsByUser]);

  // ==================== MỞ FORM TẠO XE MỚI ====================
  // Mở form tạo xe mới
  const handleOpenCreateForm = () => {
    setEditingCar(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // ==================== MỞ FORM CHỈNH SỬA XE ====================
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

  // ==================== XÓA XE ====================
  // Xóa xe khỏi danh sách
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
  // Xử lý submit form (tạo mới hoặc cập nhật)
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
      // Nếu backend trả về lỗi 400 (thường do trùng biển số hoặc trùng số khung),
      // hiển thị thông báo cụ thể theo yêu cầu.
      // Xử lý lỗi 400 (trùng biển số hoặc số khung)
      if (error?.response?.status === 400) {
        notification.open({
          message: 'Lỗi đăng ký xe',
          description: (
            <div>
              <div>Hệ thống phát hiện biển số hoặc số khung xe đã được đăng ký.</div>
              <div>
                Vui lòng liên hệ: <span style={{ display: 'inline-block', backgroundColor: '#0b9459', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>tramsacecoz@gmail.com</span>
              </div>
              <div>Và cung cấp thông tin xác minh để chúng tôi hỗ trợ xử lý.</div>
            </div>
          ),
          duration: 0,
        });
        return;
      }

      const errorMsg = error.response?.data || (isEditing ? 'Cập nhật xe thất bại!' : 'Đăng ký xe thất bại!');
      message.error(errorMsg);
    }
  };

  // ==================== ĐÓNG FORM ====================
  // Đóng form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCar(null);
    setIsEditing(false);
  };

  // ==================== TRẠNG THÁI LOADING KHI CHƯA CÓ USER ====================
  // Hiển thị loading khi chưa có user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // ==================== TRẠNG THÁI LOADING KHI ĐANG FETCH DANH SÁCH XE ====================
  // Hiển thị loading khi đang tải danh sách xe
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
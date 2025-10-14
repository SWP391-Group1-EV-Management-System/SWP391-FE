import React, { useState } from 'react';
import ServicePackageTable from "./ServicePackageTable";
import ServicePackageForm from "./ServicePackageForm";
import { message } from 'antd';

const ServicePackageManagement = () => {
  const [packages, setPackages] = useState([
    { id: 1, name: "Basic Plan", description: "Gói cơ bản cho người dùng mới, phù hợp sử dụng hàng ngày với mức giá tiết kiệm", price: 100000, duration: "30 ngày", type: "Prepaid" },
    { id: 2, name: "Premium Plan", description: "Gói cao cấp cho người dùng thường xuyên, nhiều ưu đãi và dịch vụ hỗ trợ tốt nhất", price: 300000, duration: "90 ngày", type: "VIP" },
    { id: 3, name: "Enterprise Plan", description: "Gói dành cho doanh nghiệp với quota lớn và chính sách thanh toán linh hoạt", price: 1000000, duration: "365 ngày", type: "Postpaid" }
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ padding: '20px 0' }}>
      <ServicePackageTable
        packages={packages}
        loading={loading}
        onAdd={handleAddPackage}
        onEdit={handleEditPackage}
        onDelete={handleDeletePackage}
      />
      <ServicePackageForm
        isOpen={isFormOpen}
        onCancel={handleFormCancel}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={editingPackage}
        mode={formMode}
      />
    </div>
  );
};

export default ServicePackageManagement;

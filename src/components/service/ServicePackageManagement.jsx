import React, { useState } from 'react';
import ServicePackageTable from "./ServicePackageTable";
import ServicePackageForm from "./ServicePackageForm";
import { message } from 'antd';

const ServicePackageManagement = () => {
  const [packages, setPackages] = useState([
    { packageId: 1, packageName: "Basic Plan", description: "Gói cơ bản cho người dùng mới, phù hợp sử dụng hàng ngày với mức giá tiết kiệm", billingCycle: 1, price: 100000, unit: "MONTH", quota: 50 },
    { packageId: 2, packageName: "Premium Plan", description: "Gói cao cấp cho người dùng thường xuyên, nhiều ưu đãi và dịch vụ hỗ trợ tốt nhất", billingCycle: 3, price: 300000, unit: "MONTH", quota: 200 },
    { packageId: 3, packageName: "Enterprise Plan", description: "Gói dành cho doanh nghiệp với quota lớn và chính sách thanh toán linh hoạt", billingCycle: 12, price: 1000000, unit: "MONTH", quota: 5000 }
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
    const packageToDelete = packages.find(pkg => pkg.packageId === packageId);
    setPackages(prev => prev.filter(pkg => pkg.packageId !== packageId));
    message.success(`Đã xóa gói "${packageToDelete?.packageName}" thành công!`);
  };
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (formMode === 'edit') {
        setPackages(prev => prev.map(pkg => pkg.packageId === formData.packageId ? { ...pkg, ...formData } : pkg));
        message.success(`Cập nhật gói "${formData.packageName}" thành công!`);
      } else {
        const newId = Math.max(0, ...packages.map(p => p.packageId)) + 1;
        const newPackage = { ...formData, packageId: formData.packageId || newId };
        setPackages(prev => [...prev, newPackage]);
        message.success(`Thêm gói "${formData.packageName}" thành công!`);
      }
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch (err) {
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

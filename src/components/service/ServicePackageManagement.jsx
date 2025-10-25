import React, { useState, useEffect, useRef } from 'react';
import ServicePackageTable from "./ServicePackageTable";
import ServicePackageForm from "./ServicePackageForm";
import { message } from 'antd';
import usePackage from '../../hooks/usePackage';

const ServicePackageManagement = () => {
  // Use hook for data and actions
  const { packages, loading, fetchAll, create, update, remove } = usePackage();

  // Global ref to store latest packages synchronously
  const latestPackagesRef = useRef([]);

  useEffect(() => {
    fetchAll().catch(() => {
      message.error('Không thể tải danh sách gói dịch vụ');
    });
  }, [fetchAll]);

  // Keep ref in sync whenever packages state changes
  useEffect(() => {
    if (Array.isArray(packages)) latestPackagesRef.current = packages;
  }, [packages]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formMode, setFormMode] = useState('add');

  const handleAddPackage = () => {
    setFormMode('add');
    setEditingPackage(null);
    setIsFormOpen(true);
  };
  const handleEditPackage = async (packageData) => {
    setFormMode('edit');
    setIsFormOpen(true);

    if (!packageData) {
      setEditingPackage(null);
      return;
    }

    // Try to get the freshest data from the ref first
    const id = packageData.packageId || packageData.id || packageData._id;
    if (id && Array.isArray(latestPackagesRef.current)) {
      const found = latestPackagesRef.current.find(p => p.packageId === id || p.id === id || p._id === id);
      if (found) {
        setEditingPackage(found);
        return;
      }
    }

    // Fallback: refresh the list and use returned data if available
    try {
      const data = await fetchAll();
      if (Array.isArray(data)) latestPackagesRef.current = data;
      const latest = (Array.isArray(latestPackagesRef.current) ? latestPackagesRef.current : []).find(p => p.packageId === id || p.id === id || p._id === id);
      setEditingPackage(latest || packageData);
    } catch (err) {
      setEditingPackage(packageData);
    }
  };
  const handleViewPackage = (packageData) => {
    setFormMode('view');
    setEditingPackage(packageData);
    setIsFormOpen(true);
  };
  const handleDeletePackage = async (packageId) => {
    if (!packageId) {
      message.error('Không tìm thấy ID gói, thao tác bị hủy');
      return;
    }

    try {
      await remove(packageId);
      // Refresh list after delete so UI updates immediately
      try { const data = await fetchAll(); if (Array.isArray(data)) latestPackagesRef.current = data; } catch (_) { /* ignore refresh errors */ }
      message.success('Xóa gói thành công!');
    } catch (err) {
      message.error('Xóa gói thất bại');
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'edit') {
        await update(formData.packageId, formData);
        // Refresh list after update so changes appear immediately
        try { const data = await fetchAll(); if (Array.isArray(data)) latestPackagesRef.current = data; } catch (_) { /* ignore refresh errors */ }
        message.success(`Cập nhật gói "${formData.packageName}" thành công!`);
      } else {
        await create(formData);
        // Refresh list after create so new package appears immediately
        try { const data = await fetchAll(); if (Array.isArray(data)) latestPackagesRef.current = data; } catch (_) { /* ignore refresh errors */ }
        message.success(`Thêm gói "${formData.packageName}" thành công!`);
      }
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch (err) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <ServicePackageTable
        packages={packages || []}
        loading={loading}
        onAdd={handleAddPackage}
        onEdit={handleEditPackage}
        onView={handleViewPackage}
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

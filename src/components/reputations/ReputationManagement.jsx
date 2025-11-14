import { useState } from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ReputationForm from '../reputations/ReputationForm'
import ReputationTable from '../reputations/ReputationTable';
import { useReputation } from '../../hooks/useReputation';
import PageHeader from '../PageHeader';

const { Title, Text } = Typography;

const ReputationManagement = () => {
  const { levels, loading, createLevel, updateLevel, deleteLevel } = useReputation();
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Xử lý mở modal để tạo mới
  const handleCreate = () => {
    setFormMode('create');
    setSelectedLevel(null);
    setModalVisible(true);
  };

  // Xử lý xem chi tiết
  const handleView = (record) => {
    setFormMode('view');
    setSelectedLevel(record);
    setModalVisible(true);
  };

  // Xử lý mở modal để chỉnh sửa
  const handleEdit = (record) => {
    setFormMode('edit');
    setSelectedLevel(record);
    setModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = async (levelId) => {
    await deleteLevel(levelId);
  };

  // Xử lý submit form
  const handleFormSubmit = async (values) => {
    try {
      if (formMode === 'create') {
        await createLevel(values);
      } else {
        await updateLevel(selectedLevel.levelId, values);
      }
      setModalVisible(false);
      setSelectedLevel(null);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Xử lý hủy modal
  const handleCancel = () => {
    setModalVisible(false);
    setSelectedLevel(null);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ transition: 'box-shadow 0.2s ease, transform 0.12s ease' }}
      >
        <Card
          style={{
            borderRadius: 10,
            background: '#ffffff',
            boxShadow: hovered ? '0 6px 18px rgba(6, 27, 18, 0.12)' : '0 2px 6px rgba(6, 27, 18, 0.06)'
          }}
          styles={{ body: { padding: 16 } }}
        >
          <PageHeader
            title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ThunderboltOutlined style={{ color: '#0b6b3d' }} /> Quản lý mức uy tín</span>}
            subtitle={`Tổng số: ${levels.length} mức`}
            actionButton={{
              icon: <PlusOutlined />,
              text: 'Thêm mức mới',
              onClick: handleCreate
            }}
          />

          <ReputationTable
            data={levels}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      </div>

      {/* Form Modal */}
      <ReputationForm
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleFormSubmit}
        initialValues={selectedLevel}
        loading={loading}
        mode={formMode}
      />
    </div>
  );
};

export default ReputationManagement;
import React, { useEffect } from 'react';
import { Modal, Input, Button, Form, Select } from 'antd';

const VehicleRegistrationForm = ({ isOpen, onClose, onSubmit, initialValues, isEditing }) => {
  const [form] = Form.useForm();

  // Set giá trị form khi mở modal
  useEffect(() => {
    if (isOpen && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, initialValues, form]);

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Đảm bảo chargingType là số
      const processedValues = {
        ...values,
        chargingType: values.chargingType
      };
      
      onSubmit(processedValues);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Đóng modal
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      title={<div style={{ 
        fontSize: '26px', 
        fontWeight: 'bold', 
        color: '#333', 
        letterSpacing: '0.025em', 
        justifyContent: 'center', 
        display: 'flex',
        marginBottom: '20px',
        padding: '0',
        borderRadius: '8px'
      }}>{isEditing ? 'Cập nhật xe' : 'Đăng ký xe'}</div>}
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="licensePlate"
          label="Biển số xe"
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe!' }]}
        >
          <Input placeholder="Nhập biển số xe" />
        </Form.Item>
        
        <Form.Item
          name="typeCar"
          label="Loại xe"
          rules={[{ required: true, message: 'Vui lòng nhập loại xe!' }]}
        >
          <Input placeholder="Nhập loại xe" />
        </Form.Item>

        <Form.Item
          name="chassisNumber"
          label="Số khung"
          rules={[{ required: true, message: 'Vui lòng nhập số khung!' }]}
        >
          <Input placeholder="Nhập số khung" />
        </Form.Item>

        <Form.Item
          name="chargingType"
          label="Loại sạc"
          rules={[{ required: true, message: 'Vui lòng chọn loại sạc!' }]}
        >
          <Select placeholder="Chọn loại sạc">
            <Select.Option value={1}>CCS</Select.Option>
            <Select.Option value={2}>CHAdeMO</Select.Option>
            <Select.Option value={3}>AC</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleSubmit}
            block
            size="large"
            style={{ backgroundColor: "#0b9459", color: "#fff" }}
          >
            {isEditing ? 'Cập nhật xe' : 'Đăng ký xe'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleRegistrationForm;
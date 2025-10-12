import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const UserModal = ({ visible, mode = 'view', user = {}, onClose, onSave }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    }
  }, [visible, user, form]);

  const isView = mode === 'view';

  const handleSave = () => {
    form.validateFields().then(values => {
      if (onSave) onSave({ ...user, ...values });
    });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{ borderRadius: 12 }}
      style={{ borderRadius: 12 }}
      title={
        <div style={{ background: '#166534', borderRadius: '12px 12px 0 0', padding: 12 }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
            {isView ? 'View User' : 'Edit User'}
          </span>
        </div>
      }
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item label="ID" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Required' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Required' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Invalid email' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Gender" name="gender" rules={[{ required: true }]}> 
          <Select>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Role" name="role" rules={[{ required: true }]}> 
          <Select>
            <Option value="Driver">Driver</Option>
            <Option value="Staff">Staff</Option>
            <Option value="Manager">Manager</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}> 
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {!isView && (
            <Button type="primary" style={{ background: '#166534', borderRadius: 8 }} onClick={handleSave}>
              Save Changes
            </Button>
          )}
          <Button onClick={onClose} style={{ borderRadius: 8 }}>
            Close
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UserModal;

import React from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';

const { Option } = Select;

// Custom DateInput component để Ant Design Form track được value
const DateInput = React.forwardRef(({ value, onChange, disabled, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="date"
      className="ant-input"
      style={{
        width: '100%',
        padding: '4px 11px',
        height: '32px',
        borderRadius: '6px',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
        transition: 'all 0.2s'
      }}
      value={value || ''}
      onChange={(e) => {
        onChange?.(e.target.value);
      }}
      disabled={disabled}
      {...props}
    />
  );
});

DateInput.displayName = 'DateInput';

const UserModal = ({ visible, mode = 'view', user = {}, onClose, onSave, onUpdate }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      // ✅ Parse birthDate nếu có từ API và format lại thành YYYY-MM-DD
      let formattedBirthDate = '';
      if (user.birthDate) {
        try {
          const date = new Date(user.birthDate);
          if (!isNaN(date.getTime())) {
            formattedBirthDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error parsing birthDate:', error);
        }
      }
      
      const formValues = {
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        gender: user.gender || '',
        phone: user.phone || '',
        role: user.role || '',
        status: user.status || '',
        birthDate: formattedBirthDate,
        password: '',
      };
      
      form.setFieldsValue(formValues);
    }
  }, [visible, user, form]);

  const isView = mode === 'view';

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const userId = values.id || user.id;
      
      if (!userId) {
        message.error('Không tìm thấy ID người dùng!');
        return;
      }
      
      // ✅ birthDate đã là string "YYYY-MM-DD" từ <input type="date">
      if (!values.birthDate) {
        message.error('Vui lòng chọn ngày sinh!');
        return;
      }
      
      const payload = {
        id: userId,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        gender: values.gender === 'Male',
        role: values.role.toUpperCase(),
        email: values.email,
        password: values.password?.trim() || user.password || 'password123',
        phoneNumber: values.phone || '',
        createdAt: user.createdAt || new Date().toISOString(),
        status: values.status === 'Active',
      };

      setSaving(true);
      
      if (onUpdate) {
        await onUpdate(userId, payload);
        message.success('Cập nhật người dùng thành công!');
        onSave?.();
        onClose?.();
      } else {
        throw new Error('onUpdate function not provided');
      }
    } catch (err) {
      console.error('Update error:', err);
      
      if (err.errorFields?.length > 0) {
        message.error(`Vui lòng nhập đầy đủ thông tin: ${err.errorFields[0].errors[0]}`);
      } else {
        message.error(err?.response?.data?.message || err?.message || 'Cập nhật thất bại!');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
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
        <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}> 
          <Input />
        </Form.Item>
        <Form.Item 
          label="Birth Date" 
          name="birthDate" 
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
        >
          <DateInput disabled={isView} />
        </Form.Item>
        <Form.Item label="Gender" name="gender" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}> 
          <Select>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}> 
          <Select>
            <Option value="driver">Driver</Option>
            <Option value="staff">Staff</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}> 
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>
        {!isView && (
          <Form.Item 
            label="Password" 
            name="password" 
            help="Để trống nếu không muốn đổi mật khẩu"
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          {!isView && (
            <Button 
              type="primary" 
              style={{ background: '#166534', borderRadius: 8 }} 
              onClick={handleSave} 
              loading={saving}
            >
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

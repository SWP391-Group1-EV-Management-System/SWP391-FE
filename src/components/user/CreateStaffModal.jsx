import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { createStaff } from '../../services/userService';
import dayjs from 'dayjs';

const { Option } = Select;

const CreateStaffModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Format dữ liệu để gửi lên backend
      const staffData = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate.format('YYYY-MM-DD'), // Format thành string YYYY-MM-DD
        gender: values.gender, // "true" hoặc "false" dạng string
        phoneNumber: values.phoneNumber,
        password: values.password,
      };

      console.log('📤 Sending staff data:', staffData);

      await createStaff(staffData);
      
      message.success('Tạo nhân viên thành công!');
      form.resetFields();
      onClose();
      
      // Callback để refresh danh sách
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      const errorMessage = error?.response?.data || error?.message || 'Không thể tạo nhân viên. Vui lòng thử lại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Validate số điện thoại Việt Nam
  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập số điện thoại!');
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(value)) {
      return Promise.reject('Số điện thoại không hợp lệ!');
    }
    return Promise.resolve();
  };

  // Validate mật khẩu
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập mật khẩu!');
    }
    if (value.length < 6) {
      return Promise.reject('Mật khẩu phải có ít nhất 6 ký tự!');
    }
    return Promise.resolve();
  };

  // Validate confirm password
  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng xác nhận mật khẩu!');
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject('Mật khẩu xác nhận không khớp!');
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 18, fontWeight: 600, color: '#166534' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Tạo nhân viên mới
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        {/* Row 1: Email và Số điện thoại */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="email@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ validator: validatePhone }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="0912345678"
              size="large"
            />
          </Form.Item>
        </div>

        {/* Row 2: Họ và Tên */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Họ"
            name="firstName"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Tên"
            name="lastName"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên"
              size="large"
            />
          </Form.Item>
        </div>

        {/* Row 3: Ngày sinh và Giới tính */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Ngày sinh"
            name="birthDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker
              placeholder="Chọn ngày sinh"
              size="large"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select placeholder="Chọn giới tính" size="large">
              <Option value="true">Nam</Option>
              <Option value="false">Nữ</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 4: Mật khẩu và Xác nhận mật khẩu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
              size="large"
            />
          </Form.Item>
        </div>

        {/* Footer buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Tạo nhân viên
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStaffModal;

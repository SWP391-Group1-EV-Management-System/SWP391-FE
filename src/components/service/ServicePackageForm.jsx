import React, { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Typography,
  Space,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  PlusOutlined,
  GiftOutlined, // Thay thế PackageOutlined
  DollarOutlined,
  ClockCircleOutlined,
  TagOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

/**
 * Component form để thêm/sửa gói dịch vụ
 * Sử dụng Ant Design Form và Modal
 */
const ServicePackageForm = ({ 
  isOpen = false, 
  initialData = null, 
  onSubmit, 
  onCancel,
  mode = 'add',
  loading = false
}) => {
  
  const [form] = Form.useForm();

  // Reset form khi mở/đóng hoặc thay đổi data
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        // Edit mode - điền dữ liệu cũ
        form.setFieldsValue(initialData);
      } else {
        // Add mode - reset form với giá trị mặc định
        form.resetFields();
      }
    }
  }, [isOpen, initialData, mode, form]);

  /**
   * Xử lý submit form
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        id: initialData?.id || Date.now() // Tạo ID tạm thời cho demo
      };

      console.log(`📝 ${mode === 'edit' ? 'Update' : 'Create'} package:`, submitData);
      
      if (onSubmit) {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  /**
   * Xử lý cancel
   */
  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Rules validation
   */
  const validationRules = {
    name: [
      { required: true, message: 'Vui lòng nhập tên gói dịch vụ' },
      { min: 3, message: 'Tên gói phải có ít nhất 3 ký tự' },
      { max: 100, message: 'Tên gói không được quá 100 ký tự' }
    ],
    description: [
      { required: true, message: 'Vui lòng nhập mô tả' },
      { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
    ],
    price: [
      { required: true, message: 'Vui lòng nhập giá' },
      { type: 'number', min: 0, message: 'Giá phải là số dương' }
    ],
    duration: [
      { required: true, message: 'Vui lòng nhập thời hạn' }
    ],
    type: [
      { required: true, message: 'Vui lòng chọn loại gói' }
    ]
  };

  return (
    <Modal
      title={
        <Space>
          {mode === 'edit' ? <EditOutlined /> : <PlusOutlined />}
          <Title level={4} style={{ margin: 0 }}>
            {mode === 'edit' ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
          </Title>
        </Space>
      }
      open={isOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      confirmLoading={loading}
      width={600}
      destroyOnHidden={true} // Fixed: Changed from destroyOnClose
      maskClosable={false}
      okButtonProps={{
        size: 'large',
        style: { borderRadius: '6px' }
      }}
      cancelButtonProps={{
        size: 'large',
        style: { borderRadius: '6px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'Prepaid'
        }}
        autoComplete="off"
        style={{ marginTop: '20px' }}
      >
        {/* Tên gói */}
        <Form.Item
          name="name"
          label="Tên gói dịch vụ"
          rules={validationRules.name}
        >
          <Input
            placeholder="VD: Gói Premium, Gói Standard..."
            prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
            size="large"
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={validationRules.description}
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về gói dịch vụ..."
            showCount
            maxLength={500}
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        {/* Giá và Loại gói */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Giá (VNĐ)"
              rules={validationRules.price}
            >
              <InputNumber
                style={{ width: '100%', borderRadius: '6px' }}
                placeholder="Nhập giá"
                prefix={<DollarOutlined />}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="type"
              label="Loại gói"
              rules={validationRules.type}
            >
              <Select
                placeholder="Chọn loại gói"
                size="large"
                style={{ borderRadius: '6px' }}
                suffixIcon={<TagOutlined />}
              >
                <Option value="Prepaid">
                  <Space>
                    🔵 Prepaid
                  </Space>
                </Option>
                <Option value="VIP">
                  <Space>
                    👑 VIP
                  </Space>
                </Option>
                <Option value="Postpaid">
                  <Space>
                    🔒 Postpaid
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Thời hạn */}
        <Form.Item
          name="duration"
          label="Thời hạn sử dụng"
          rules={validationRules.duration}
        >
          <Input
            placeholder="VD: 30 ngày, 90 ngày, 1 năm..."
            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            size="large"
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServicePackageForm;
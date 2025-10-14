import React, { useEffect } from 'react';
import { Modal, Typography, Space, Row, Col, Select } from 'antd';
import { EditOutlined, PlusOutlined, GiftOutlined, DollarOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const { Option } = Select;
const { Title } = Typography;

// Yup validation schema
const ServicePackageSchema = Yup.object().shape({
  name: Yup.string()
    .required('Vui lòng nhập tên gói dịch vụ')
    .min(3, 'Tên gói phải có ít nhất 3 ký tự')
    .max(100, 'Tên gói không được quá 100 ký tự'),
  description: Yup.string()
    .required('Vui lòng nhập mô tả')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  price: Yup.number()
    .typeError('Giá phải là số')
    .required('Vui lòng nhập giá')
    .min(0, 'Giá phải là số dương'),
  duration: Yup.string()
    .required('Vui lòng nhập thời hạn'),
  type: Yup.string()
    .required('Vui lòng chọn loại gói'),
});

const ServicePackageForm = ({
  isOpen = false,
  initialData = null,
  onSubmit,
  onCancel,
  mode = 'add',
  loading = false
}) => {
  const initialValues = initialData && mode === 'edit'
    ? initialData
    : { name: '', description: '', price: '', duration: '', type: 'Prepaid' };

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
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ServicePackageSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          const submitData = {
            ...values,
            id: initialData?.id || Date.now()
          };
          await onSubmit?.(submitData);
          setSubmitting(false);
          resetForm();
        }}
      >
        {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
          <Form style={{ marginTop: '20px' }}>
            {/* Tên gói */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="name">Tên gói dịch vụ</label>
              <Field name="name">
                {({ field }) => (
                  <input
                    {...field}
                    placeholder="VD: Gói Premium, Gói Standard..."
                    prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
                    size="large"
                    style={{ borderRadius: '6px', width: '100%', padding: '8px' }}
                  />
                )}
              </Field>
              <ErrorMessage name="name" component="div" style={{ color: 'red' }} />
            </div>

            {/* Mô tả */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="description">Mô tả chi tiết</label>
              <Field name="description">
                {({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về gói dịch vụ..."
                    maxLength={500}
                    style={{ borderRadius: '6px', width: '100%', padding: '8px' }}
                  />
                )}
              </Field>
              <ErrorMessage name="description" component="div" style={{ color: 'red' }} />
            </div>

            {/* Giá và Loại gói */}
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="price">Giá (VNĐ)</label>
                  <Field name="price">
                    {({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="Nhập giá"
                        style={{ borderRadius: '6px', width: '100%', padding: '8px' }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="price" component="div" style={{ color: 'red' }} />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="type">Loại gói</label>
                  <Select
                    value={values.type}
                    onChange={value => setFieldValue('type', value)}
                    size="large"
                    style={{ borderRadius: '6px', width: '100%' }}
                    suffixIcon={<TagOutlined />}
                  >
                    <Option value="Prepaid">🔵 Prepaid</Option>
                    <Option value="VIP">👑 VIP</Option>
                    <Option value="Postpaid">🔒 Postpaid</Option>
                  </Select>
                  <ErrorMessage name="type" component="div" style={{ color: 'red' }} />
                </div>
              </Col>
            </Row>

            {/* Thời hạn */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="duration">Thời hạn sử dụng</label>
              <Field name="duration">
                {({ field }) => (
                  <input
                    {...field}
                    placeholder="VD: 30 ngày, 90 ngày, 1 năm..."
                    prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                    size="large"
                    style={{ borderRadius: '6px', width: '100%', padding: '8px' }}
                  />
                )}
              </Field>
              <ErrorMessage name="duration" component="div" style={{ color: 'red' }} />
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || loading}
                style={{ marginRight: 8, borderRadius: '6px', padding: '8px 16px' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                style={{ borderRadius: '6px', padding: '8px 16px', background: '#1890ff', color: '#fff' }}
              >
                {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ServicePackageForm;
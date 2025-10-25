import React, { useEffect, useRef, useState } from 'react';
import { Modal, Typography, Space, Row, Col, Select } from 'antd';
import { EditOutlined, PlusOutlined, GiftOutlined, DollarOutlined, ClockCircleOutlined, TagOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const { Option } = Select;
const { Title, Text } = Typography;

// Yup validation schema for new package model
const ServicePackageSchema = Yup.object().shape({
  packageName: Yup.string()
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
  billingCycle: Yup.number()
    .typeError('Chu kỳ phải là số (tháng)')
    .required('Vui lòng nhập chu kỳ thanh toán')
    .min(0, 'Chu kỳ phải >= 0'),
  unit: Yup.string().required('Vui lòng chọn đơn vị'),
  quota: Yup.number()
    .typeError('Quota phải là số')
    .required('Vui lòng nhập quota')
    .min(0, 'Quota phải >= 0'),
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
    ? ({
        packageId: initialData.packageId,
        packageName: initialData.packageName || '',
        description: initialData.description || '',
        billingCycle: initialData.billingCycle ?? 0,
        price: initialData.price ?? 0,
        unit: initialData.unit || 'MONTH',
        quota: initialData.quota ?? 0,
      })
    : { packageId: null, packageName: '', description: '', billingCycle: 0, price: 0, unit: 'MONTH', quota: 0 };

  const resetFormRef = useRef(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmValues, setConfirmValues] = useState(null);

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
      width={640}
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ServicePackageSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          // Show confirmation modal first
          setConfirmValues(values);
          resetFormRef.current = resetForm;
          setConfirmVisible(true);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, handleSubmit, setFieldValue, values, resetForm }) => (
          <Form style={{ marginTop: '12px' }}>
            {/* Tên gói */}
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="packageName">Tên gói dịch vụ</label>
              <Field name="packageName">
                {({ field }) => (
                  <input
                    {...field}
                    placeholder="VD: Gói Premium, Gói Standard..."
                    size="large"
                    style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                  />
                )}
              </Field>
              <ErrorMessage name="packageName" component="div" style={{ color: 'red' }} />
            </div>

            {/* Mô tả */}
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="description">Mô tả chi tiết</label>
              <Field name="description">
                {({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về gói dịch vụ..."
                    maxLength={500}
                    style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                  />
                )}
              </Field>
              <ErrorMessage name="description" component="div" style={{ color: 'red' }} />
            </div>

            <Row gutter={12}>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <label htmlFor="billingCycle">Chu kỳ (tháng)</label>
                  <Field name="billingCycle">
                    {({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="0"
                        style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="billingCycle" component="div" style={{ color: 'red' }} />
                </div>
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <label htmlFor="price">Giá (VNĐ)</label>
                  <Field name="price">
                    {({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="Nhập giá"
                        style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="price" component="div" style={{ color: 'red' }} />
                </div>
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <label htmlFor="unit">Đơn vị</label>
                  <Select
                    value={values.unit}
                    onChange={value => setFieldValue('unit', value)}
                    size="large"
                    style={{ borderRadius: '6px', width: '100%', marginTop: 6 }}
                  >
                    <Option value="MONTH">Tháng</Option>
                    <Option value="HOUR">Giờ</Option>
                    <Option value="SESSION">Phiên sạc</Option>
                  </Select>
                  <ErrorMessage name="unit" component="div" style={{ color: 'red' }} />
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="quota">Quota (kWh hoặc số lần)</label>
              <Field name="quota">
                {({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="Nhập quota"
                    style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                  />
                )}
              </Field>
              <ErrorMessage name="quota" component="div" style={{ color: 'red' }} />
            </div>

            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onCancel?.();
                }}
                disabled={isSubmitting || loading}
                style={{ marginRight: 8, borderRadius: '6px', padding: '8px 16px' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                style={{ borderRadius: '6px', padding: '8px 16px', background: '#0b6b3d', color: '#fff' }}
              >
                Đăng ký
              </button>
            </div>

            {/* Xác nhận thanh toán Modal */}
            <Modal
              title={<Space><ThunderboltOutlined /> Xác nhận thanh toán</Space>}
              open={confirmVisible}
              onCancel={() => setConfirmVisible(false)}
              footer={null}
            >
              {confirmValues && (
                <div>
                  <Text strong>{confirmValues.packageName}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Text>Giá: </Text><Text strong style={{ color: '#0b6b3d' }}>{Number(confirmValues.price).toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>Chu kỳ: </Text><Text>{confirmValues.billingCycle} tháng</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>Đơn vị: </Text><Text>{confirmValues.unit}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>Quota: </Text><Text>{confirmValues.quota}</Text>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">{confirmValues.description}</Text>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: 18 }}>
                    <button
                      onClick={() => setConfirmVisible(false)}
                      style={{ marginRight: 8, borderRadius: '6px', padding: '8px 16px' }}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Call parent onSubmit with structured package object
                          const submitData = {
                            packageId: initialData?.packageId || Date.now(),
                            packageName: confirmValues.packageName,
                            description: confirmValues.description,
                            billingCycle: Number(confirmValues.billingCycle),
                            price: Number(confirmValues.price),
                            unit: confirmValues.unit,
                            quota: Number(confirmValues.quota),
                          };
                          await onSubmit?.(submitData);
                          // reset form if provided
                          resetFormRef.current?.();
                          setConfirmVisible(false);
                          onCancel?.();
                        } catch (e) {
                          // ignore, parent handles errors
                        }
                      }}
                      style={{ borderRadius: '6px', padding: '8px 16px', background: '#0b6b3d', color: '#fff' }}
                    >
                      Xác nhận thanh toán
                    </button>
                  </div>
                </div>
              )}
            </Modal>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ServicePackageForm;
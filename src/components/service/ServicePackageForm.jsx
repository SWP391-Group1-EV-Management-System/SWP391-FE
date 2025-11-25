import React, { useRef, useState } from 'react';
import { Modal, Typography, Space, Row, Col, Select, message } from 'antd';
import { EditOutlined, PlusOutlined, ThunderboltOutlined, EyeOutlined } from '@ant-design/icons';
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
    .min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  price: Yup.number()
    .typeError('Giá phải là số')
    .required('Vui lòng nhập giá')
    .min(10000, 'Giá phải lớn hơn 10,000 VNĐ'),
  billingCycle: Yup.number()
    .typeError('Chu kỳ phải là số (tháng)')
    .required('Vui lòng nhập chu kỳ thanh toán')
    .min(1, 'Chu kỳ phải >= 1'),
  unit: Yup.string().required('Vui lòng chọn đơn vị'),
  quota: Yup.number()
    .typeError('Dung lượng phải là số')
    .required('Vui lòng nhập dung lượng')
    .min(1000, 'Dung lượng phải >= 1000'),
});

const ServicePackageForm = ({
  isOpen = false,
  initialData = null,
  onSubmit,
  onCancel,
  mode = 'add',
}) => {
  const initialValues = initialData && mode === 'edit'
    ? ({
        packageId: initialData.packageId != null ? String(initialData.packageId) : '',
        packageName: initialData.packageName || '',
        description: initialData.description || '',
        billingCycle: initialData.billingCycle ?? 0,
        price: initialData.price ?? 0,
        unit: initialData.unit ?? 'Package',
        quota: initialData.quota ?? 0,
      })
    : { packageId: '', packageName: '', description: '', billingCycle: 0, price: 0, unit: 'Package', quota: 0 };

  const resetFormRef = useRef(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmValues, setConfirmValues] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Read-only view mode: show details and only a cancel button
  if (mode === 'view') {
    const data = initialData || initialValues;
    return (
      <Modal
        title={<Space>{<EyeOutlined />}<Title level={4} style={{ margin: 0 }}>Xem chi tiết gói</Title></Space>}
        open={isOpen}
        onCancel={onCancel}
        footer={(
          <div style={{ textAlign: 'right' }}>
            <button onClick={onCancel} style={{ borderRadius: '6px', padding: '8px 16px' }}>Hủy</button>
          </div>
        )}
        width={640}
        destroyOnHidden={true}
        maskClosable={false}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>Tên gói</Text>
          <div style={{ marginTop: 6 }}>{String(data.packageName || '')}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Mô tả</Text>
          <div style={{ marginTop: 6 }}>{String(data.description || '')}</div>
        </div>
        <Row gutter={12}>
          <Col span={8}>
            <Text strong>Chu kỳ (tháng)</Text>
            <div style={{ marginTop: 6 }}>{Number(data.billingCycle || 0)} tháng</div>
          </Col>
          <Col span={8}>
            <Text strong>Giá (VNĐ)</Text>
            <div style={{ marginTop: 6 }}>{Number(data.price || 0).toLocaleString('vi-VN')} VNĐ</div>
          </Col>
          <Col span={8}>
            <Text strong>Dung lượng</Text>
            <div style={{ marginTop: 6 }}>{Number(data.quota || 0)}</div>
          </Col>
        </Row>
        <div style={{ marginTop: 12 }}>
          <Text strong>Số tháng</Text>
          <div style={{ marginTop: 6 }}>{String(data.unit || '')}</div>
        </div>
      </Modal>
    );
  }

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
        {({ isSubmitting, resetForm }) => (
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
              <label htmlFor="quota">Dung lượng(kWh)</label>
              <Field name="quota">
                {({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Nhập quota"
                    style={{ borderRadius: '6px', width: '100%', padding: '8px', marginTop: 6 }}
                  />
                )}
              </Field>
              <ErrorMessage name="quota" component="div" style={{ color: 'red' }} />
              </div>
              </Col>
            </Row>
            <div style={{ textAlign: 'right', marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSubmitLoading(false);
                  onCancel?.();
                }}
                disabled={isSubmitting || submitLoading}
                style={{ marginRight: 8, borderRadius: '6px', padding: '8px 16px' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitLoading}
                style={{ borderRadius: '6px', padding: '8px 16px', background: '#0b6b3d', color: '#fff' }}
              >
                Đăng ký
              </button>
            </div>

            {/* Xác nhận thanh toán Modal */}
            <Modal
              title={<Space><ThunderboltOutlined /> Xác nhận</Space>}
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
                    <Text>Dung lượng: </Text><Text>{confirmValues.quota} kWh</Text>
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
                        setSubmitLoading(true);
                        try {
                          // Build submit data
                          const submitData = {
                            packageId: initialData?.packageId != null ? String(initialData.packageId) : String(Date.now()),
                            packageName: String(confirmValues.packageName || ''),
                            description: String(confirmValues.description || ''),
                            billingCycle: Number(confirmValues.billingCycle || 0),
                            price: Number(confirmValues.price || 0),
                            unit: String(confirmValues.unit || 'Package'),
                            quota: Number(confirmValues.quota || 0),
                          };

                          // Delegate to parent handler
                          await onSubmit?.(submitData);

                          // reset form, close modal and notify parent
                          resetFormRef.current?.();
                          setConfirmVisible(false);
                          onCancel?.();
                        } catch (e) {
                          message.error('Có lỗi xảy ra, vui lòng thử lại!');
                        } finally {
                          setSubmitLoading(false);
                        }
                      }}
                      style={{ borderRadius: '6px', padding: '8px 16px', background: '#0b6b3d', color: '#fff' }}
                      disabled={submitLoading}
                    >
                      Xác nhận
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
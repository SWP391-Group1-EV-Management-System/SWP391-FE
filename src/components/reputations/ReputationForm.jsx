import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ReputationForm = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  initialValues, 
  loading,
  mode = 'create' // 'create', 'edit', or 'view'
}) => {
  const validationSchema = Yup.object({
    levelName: Yup.string()
      .required('Vui lòng nhập tên mức uy tín')
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được vượt quá 100 ký tự'),
    minScore: Yup.number()
      .required('Vui lòng nhập điểm tối thiểu')
      .min(0, 'Điểm tối thiểu phải >= 0')
      .max(100, 'Điểm tối thiểu phải <= 100')
      .test('less-than-max', 'Điểm tối thiểu phải nhỏ hơn điểm tối đa', function(value) {
        const { maxScore } = this.parent;
        return value < maxScore;
      }),
    maxScore: Yup.number()
      .required('Vui lòng nhập điểm tối đa')
      .min(0, 'Điểm tối đa phải >= 0')
      .max(100, 'Điểm tối đa phải <= 100')
      .test('greater-than-min', 'Điểm tối đa phải lớn hơn điểm tối thiểu', function(value) {
        const { minScore } = this.parent;
        return value > minScore;
      }),
    maxWaitMinutes: Yup.number()
      .required('Vui lòng nhập thời gian chờ tối đa')
      .min(1, 'Thời gian chờ phải >= 1 phút')
      .max(1440, 'Thời gian chờ phải <= 1440 phút (24 giờ)'),
    description: Yup.string()
      .required('Vui lòng nhập mô tả')
      .min(10, 'Mô tả phải có ít nhất 10 ký tự')
      .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      levelName: '',
      minScore: 0,
      maxScore: 0,
      maxWaitMinutes: 0,
      description: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (!visible) {
      formik.resetForm();
    }
  }, [visible]);

  return (
    <Modal
      title={
        mode === 'create' 
          ? '+ Thêm mức uy tín mới' 
          : mode === 'view'
          ? 'Chi tiết mức uy tín'
          : 'Chỉnh sửa mức uy tín'
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Form.Item
          label="Tên mức uy tín"
          validateStatus={formik.touched.levelName && formik.errors.levelName ? 'error' : ''}
          help={formik.touched.levelName && formik.errors.levelName}
          required
        >
          <Input
            name="levelName"
            placeholder="VD: Gói Premium, Gói Standard..."
            value={formik.values.levelName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={mode === 'view'}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          validateStatus={formik.touched.description && formik.errors.description ? 'error' : ''}
          help={formik.touched.description && formik.errors.description}
          required
        >
          <Input.TextArea
            name="description"
            placeholder="Nhập mô tả chi tiết về mức uy tín..."
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={mode === 'view'}
          />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            label="Điểm tối thiểu"
            validateStatus={formik.touched.minScore && formik.errors.minScore ? 'error' : ''}
            help={formik.touched.minScore && formik.errors.minScore}
            required
            style={{ flex: 1, minWidth: 150 }}
          >
            <InputNumber
              name="minScore"
              placeholder="0"
              min={0}
              max={100}
              style={{ width: '100%' }}
              value={formik.values.minScore}
              onChange={(value) => formik.setFieldValue('minScore', value)}
              onBlur={formik.handleBlur}
              disabled={mode === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="Điểm tối đa"
            validateStatus={formik.touched.maxScore && formik.errors.maxScore ? 'error' : ''}
            help={formik.touched.maxScore && formik.errors.maxScore}
            required
            style={{ flex: 1, minWidth: 150 }}
          >
            <InputNumber
              name="maxScore"
              placeholder="0"
              min={0}
              max={100}
              style={{ width: '100%' }}
              value={formik.values.maxScore}
              onChange={(value) => formik.setFieldValue('maxScore', value)}
              onBlur={formik.handleBlur}
              disabled={mode === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian chờ (phút)"
            validateStatus={formik.touched.maxWaitMinutes && formik.errors.maxWaitMinutes ? 'error' : ''}
            help={formik.touched.maxWaitMinutes && formik.errors.maxWaitMinutes}
            required
            style={{ flex: 1, minWidth: 150 }}
          >
            <InputNumber
              name="maxWaitMinutes"
              placeholder="0"
              min={1}
              max={1440}
              style={{ width: '100%' }}
              value={formik.values.maxWaitMinutes}
              onChange={(value) => formik.setFieldValue('maxWaitMinutes', value)}
              onBlur={formik.handleBlur}
              disabled={mode === 'view'}
            />
          </Form.Item>
        </Space>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              {mode === 'view' ? 'Đóng' : 'Hủy'}
            </Button>
            {mode !== 'view' && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!formik.isValid || !formik.dirty}
              >
                {mode === 'create' ? 'Đăng ký' : 'Cập nhật'}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReputationForm;
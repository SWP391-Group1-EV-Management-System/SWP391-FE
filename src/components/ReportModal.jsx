import React from "react";
import { Modal, Button, Form, Input, Select, Checkbox, message } from "antd";
import { Formik } from "formik";
import * as Yup from "yup";

const { Option } = Select;

const reportValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  type: Yup.string().required("Type is required"),
  isUrgent: Yup.boolean(),
});

const errorTypes = [
  { value: "connection", label: "Kết nối lỏng, chập điện" },
  { value: "component", label: "Hư hỏng linh kiện (quá nhiệt, hỏng bộ sạc)" },
  { value: "communication", label: "Lỗi giao tiếp giữa sạc và xe" },
  { value: "voltage", label: "Lỗi điện áp (quá cao, quá thấp)" },
  { value: "battery", label: "Hỏng pin/bình ắc quy" },
  { value: "other", label: "Khác" },
];

const ReportModal = ({ open, onClose, reportData, isAdmin, onAddReport, initialValues }) => {
  return (
    <Modal
      title={reportData ? "View Report" : "Add Report"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Formik
        onSubmit={(values, { resetForm }) => {
          if (!isAdmin) {
            onAddReport(values);
            message.success("Gửi báo cáo thành công!");
            resetForm();
          }
          onClose();
        }}
        initialValues={initialValues}
        validationSchema={reportValidationSchema}
        enableReinitialize={true}
      >
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Report Title"
              validateStatus={touched.title && errors.title ? "error" : ""}
              help={touched.title && errors.title}
            >
              <Input
                name="title"
                placeholder="Enter Report Title"
                value={values.title}
                onChange={handleChange}
                disabled={isAdmin}
              />
            </Form.Item>

            <Form.Item
              label="Report Description"
              validateStatus={touched.description && errors.description ? "error" : ""}
              help={touched.description && errors.description}
            >
              <Input.TextArea
                name="description"
                placeholder="Enter Report Description"
                value={values.description}
                onChange={handleChange}
                disabled={isAdmin}
              />
            </Form.Item>

            <Form.Item
              label="Report Type"
              validateStatus={touched.type && errors.type ? "error" : ""}
              help={touched.type && errors.type}
            >
              <Select
                name="type"
                value={values.type}
                onChange={(value) => handleChange({ target: { name: "type", value } })}
                disabled={isAdmin}
              >
                {errorTypes.map((err) => (
                  <Option key={err.value} value={err.value}>{err.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Checkbox
                name="isUrgent"
                checked={values.isUrgent}
                onChange={handleChange}
                disabled={isAdmin}
              >
                Mark as Urgent
              </Checkbox>
            </Form.Item>

            <div style={{ textAlign: "right" }}>
              <Button onClick={onClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              {!isAdmin && (
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ReportModal;
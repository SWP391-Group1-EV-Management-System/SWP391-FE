import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { TbUser, TbMail, TbPhone, TbShield, TbArrowLeft } from "react-icons/tb";
import { Modal, notification, Button, Form, Input, Row, Col, Select } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateProfile, updatePassword } from "../../services/userService";
import "../../assets/styles/UserProfile.css";

/**
 * Component hiển thị thông tin profile của user
 */
function UserProfile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // Handler quay về trang home
  const handleBackToHome = () => {
    navigate("/app/home");
  };

  // Hiển thị loading khi đang fetch dữ liệu
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Đang tải thông tin...</div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có dữ liệu user
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Nút quay lại */}
      <button 
        onClick={handleBackToHome}
        className="profile-back-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1.4rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '1.5rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#218838';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#28a745';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <TbArrowLeft size={20} />
        Quay về trang chủ
      </button>

      <div className="profile-card">
        {/* Header với avatar */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.firstName?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button type="default" onClick={() => setEditOpen(true)}>
              Chỉnh sửa
            </Button>
            <Button type="primary" onClick={() => setPwdOpen(true)} style={{ background: '#1677ff', borderColor: '#1677ff' }}>
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="profile-body">
          <h3 className="profile-section-title">Thông tin cá nhân</h3>
          
          {/* Email */}
          <div className="profile-info-item">
            <div className="profile-info-icon">
              <TbMail size={20} />
            </div>
            <div className="profile-info-content">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{user.email}</span>
            </div>
          </div>

          {/* Số điện thoại */}
          {user.phone && (
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <TbPhone size={20} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Số điện thoại</span>
                <span className="profile-info-value">{user.phone}</span>
              </div>
            </div>
          )}

          {/* Giới tính */}
          <div className="profile-info-item">
            <div className="profile-info-icon">
              <TbUser size={20} />
            </div>
            <div className="profile-info-content">
              <span className="profile-info-label">Giới tính</span>
              <span className="profile-info-value">
                {user.gender ? "Nam" : "Nữ"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        destroyOnClose
      >
        <EditUserForm
          initialUser={user}
          onCancel={() => setEditOpen(false)}
          onSaved={async () => {
            setEditOpen(false);
            try {
              await fetchUserProfile();
            } catch (e) {
              // ignore
            }
          }}
        />
      </Modal>

      {/* Change password modal */}
      <Modal
        title="Đổi mật khẩu"
        open={pwdOpen}
        onCancel={() => setPwdOpen(false)}
        footer={null}
        destroyOnClose
      >
        <ChangePasswordForm
          userId={user.id || user.userId || user.userID}
          onCancel={() => setPwdOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default UserProfile;

function EditUserForm({ initialUser, onCancel, onSaved }) {
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: initialUser.firstName || "",
      lastName: initialUser.lastName || "",
      email: initialUser.email || "",
      phone: initialUser.phone || "",
      // Normalize gender to string values: 'male'|'female'|'other'|''
      gender:
        initialUser.gender === true
          ? "male"
          : initialUser.gender === false
          ? "female"
          : typeof initialUser.gender === "string"
          ? (initialUser.gender || "").toLowerCase()
          : "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Bắt buộc"),
      lastName: Yup.string().required("Bắt buộc"),
      // Email is locked (read-only) in the UI, do not allow editing here
      email: Yup.string().email("Email không hợp lệ").nullable(),
      phone: Yup.string().nullable(),
      gender: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        // convert gender string to boolean expected by backend
        const genderBool =
          values.gender === "male" ? true : values.gender === "female" ? false : undefined;

        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        };
        if (typeof genderBool === "boolean") payload.gender = genderBool;

        await updateProfile(initialUser.id || initialUser.userId || initialUser.userID, payload);

        notification.success({ message: "Cập nhật thành công" });
        if (typeof onSaved === "function") await onSaved();
      } catch (err) {
        console.error("Error updating user:", err);
        notification.error({ message: "Cập nhật thất bại", description: err?.message || String(err) });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Họ"
            validateStatus={formik.touched.firstName && formik.errors.firstName ? "error" : ""}
            help={formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : null}
          >
            <Input name="firstName" value={formik.values.firstName} onChange={formik.handleChange} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Tên"
            validateStatus={formik.touched.lastName && formik.errors.lastName ? "error" : ""}
            help={formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : null}
          >
            <Input name="lastName" value={formik.values.lastName} onChange={formik.handleChange} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Email"
            validateStatus={formik.touched.email && formik.errors.email ? "error" : ""}
            help={formik.touched.email && formik.errors.email ? formik.errors.email : null}
          >
            <Input
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              disabled
              readOnly
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item label="Số điện thoại">
            <Input name="phone" value={formik.values.phone || ""} onChange={formik.handleChange} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12} align="middle">
        <Col xs={24} sm={12}>
          <Form.Item label="Giới tính">
            <Select
              value={formik.values.gender}
              onChange={(val) => formik.setFieldValue("gender", val)}
              placeholder="Chọn giới tính"
            >
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} />
      </Row>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button onClick={onCancel}>Hủy</Button>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Lưu
        </Button>
      </div>
    </Form>
  );
}

function ChangePasswordForm({ userId, onCancel }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Nhập mật khẩu hiện tại"),
      newPassword: Yup.string().required("Nhập mật khẩu mới").min(6, "Mật khẩu tối thiểu 6 ký tự"),
      confirmPassword: Yup.string()
        .required("Xác nhận mật khẩu mới")
        .oneOf([Yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const payload = {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        };

        await updatePassword(userId, payload);
        notification.success({ message: "Đổi mật khẩu thành công" });
        resetForm();
        if (typeof onCancel === "function") onCancel();
      } catch (err) {
        console.error("Error changing password:", err);
        const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || String(err);
        notification.error({ message: "Mật khẩu cũ không đúng", description: String(serverMsg) });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Mật khẩu hiện tại</label>
        <Input.Password
          name="oldPassword"
          value={formik.values.oldPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.oldPassword && formik.errors.oldPassword && (
          <div style={{ color: "#ff4d4f", marginTop: 6 }}>{formik.errors.oldPassword}</div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Mật khẩu mới</label>
        <Input.Password
          name="newPassword"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div style={{ color: "#ff4d4f", marginTop: 6 }}>{formik.errors.newPassword}</div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Xác nhận mật khẩu mới</label>
        <Input.Password
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div style={{ color: "#ff4d4f", marginTop: 6 }}>{formik.errors.confirmPassword}</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button onClick={onCancel}>Hủy</Button>
        <Button type="primary" htmlType="submit" loading={loading} onClick={() => {}}>
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  );
}
import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { TbUser, TbMail, TbPhone, TbShield, TbArrowLeft } from "react-icons/tb";
import "../../assets/styles/UserProfile.css";

/**
 * Component hiển thị thông tin profile của user
 */
function UserProfile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
          <span className={`profile-status ${user.active ? "active" : "inactive"}`}>
            {user.active ? "Đang hoạt động" : "Không hoạt động"}
          </span>
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

          {/* Role */}
          <div className="profile-info-item">
            <div className="profile-info-icon">
              <TbShield size={20} />
            </div>
            <div className="profile-info-content">
              <span className="profile-info-label">Vai trò</span>
              <span className="profile-info-value profile-role">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
// Trang quên mật khẩu - gửi OTP đến email để reset mật khẩu
import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "../assets/styles/ForgotPassword.css";
import { IoClose } from "react-icons/io5";

function ForgotPasswordPage() {
  // Quản lý trạng thái email
  const [email, setEmail] = useState("");
  
  // Quản lý trạng thái loading và thông báo
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Cập nhật email khi user nhập
  const handleEmailChange = (e) => setEmail(e.target.value);

  // Gửi yêu cầu OTP đến email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      // Gọi API gửi OTP đến email
      const response = await axios.post(
        "http://localhost:8080/users/forgot-password",
        { email }
      );

      setMessage("Mã OTP đã được gửi đến email của bạn.");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Lỗi kết nối!");
      } else {
        setError("Lỗi khi gửi yêu cầu!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị form nhập email
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-inner">
          {/* Nút quay lại trang đăng nhập */}
          <button
            className="back-btn"
            onClick={() => navigate("/login")}
            aria-label="Quay lại đăng nhập"
          >
            <IoClose size={24} />
          </button>

          <h2>Quên Mật Khẩu</h2>
          <p>Vui lòng nhập email để nhận mã OTP xác thực.</p>

          {/* Hiển thị thông báo lỗi */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Hiển thị thông báo thành công */}
          {message && <div className="success-message">{message}</div>}

          {/* Form nhập email */}
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email của bạn"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
          
          {/* Footer copyright */}
          <div className="copyright">
            <span> © 2025 Group1SE1818. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

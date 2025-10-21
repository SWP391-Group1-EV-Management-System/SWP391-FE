import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "../assets/styles/ForgotPassword.css"; // Thêm CSS cho trang quên mật khẩu
import { IoClose } from "react-icons/io5";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/users/forgot-password", // Đảm bảo API này tồn tại
        { email }
      );

      setMessage("Mã OTP đã được gửi đến email của bạn.");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        setError(error.response.data.message || "Lỗi kết nối!");
      } else {
        setError("Lỗi khi gửi yêu cầu!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-inner">
          <button
            className="back-btn"
            onClick={() => navigate("/login")}
            aria-label="Quay lại đăng nhập"
          >
            <IoClose size={24} />
          </button>

          <h2>Quên Mật Khẩu</h2>
          <p>Vui lòng nhập email để nhận mã OTP xác thực.</p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

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
          <div className="copyright">
            <span> © 2025 Group1SE1818. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

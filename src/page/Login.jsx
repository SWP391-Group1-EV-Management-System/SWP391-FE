import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // Thay react-router-dom bằng react-router
import "../assets/styles/Login.css";
import { CgMail } from "react-icons/cg";
import { TbLock } from "react-icons/tb"; // Sửa từ TbLockPassword
import { IoIosArrowForward } from "react-icons/io";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useLogin } from "../hooks/useLogin";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useLogin();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToWelcome = () => {
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.username.value;
    const password = e.target.password.value;
    await login(email, password);
  };

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <div className="login-inner">
            <button className="back-to-welcome-btn" onClick={handleBackToWelcome} aria-label="Quay lại trang chính">
              <IoClose size={24} />
            </button>
            <h2>Đăng nhập</h2>
            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="username">
                  <CgMail size={28} />
                  Gmail
                </label>
                <input type="text" id="username" name="username" required placeholder="email@example.com" />
              </div>
              <div className="password-field">
                <label htmlFor="password">
                  <TbLock size={24} />
                  Mật khẩu
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
              </div>
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" id="remember-password" />
                  <span className="checkmark"></span>
                  <span>Nhớ mật khẩu</span>
                </label>
                <a href="#" className="forgot-password-link">
                  Quên mật khẩu?
                </a>
              </div>
              <button
                type="submit"
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Đăng nhập <IoIosArrowForward size={24} />
              </button>
              <div className="register-prompt">
                <div>Không có tài khoản?</div>
                <a
                  href="/register"
                  style={{
                    color: "#0b9459",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  Đăng ký
                </a>
              </div>
            </form>
            <div className="copyright">
              <span> © 2025 Group1SE1818. All rights reserved.</span>
            </div>
            <div className="footer"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

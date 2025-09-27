import React, { useState } from "react";
import "../assets/styles/Register.css";
import { CgMail } from "react-icons/cg";
import { TbLockPassword } from "react-icons/tb";
import { IoIosArrowForward } from "react-icons/io";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div className="register-page">
        <div className="register-container">
          <div className="register-inner">
            <h2>Đăng ký</h2>
            <form>
              <div>
                <label htmlFor="email">
                  <CgMail size={28} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="password-field">
                <label htmlFor="password">
                  <TbLockPassword size={24} />
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
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div className="password-field">
                <label htmlFor="confirmPassword">
                  <TbLockPassword size={24} />
                  Xác nhận mật khẩu
                </label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    {showConfirmPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-options-register">
                <label className="checkbox-label">
                  <input type="checkbox" id="agree-terms" required />
                  <span className="checkmark"></span>
                  <span>Tôi đồng ý với <a href="#">điều khoản sử dụng</a></span>
                </label>
              </div>
              <button type="submit" className="register-button">
                Đăng ký <IoIosArrowForward size={24} />
              </button>
              <div className="login-prompt">
                <div>Đã có tài khoản?</div>
                <a href="/login" className="login-link">
                  Đăng nhập
                </a>
              </div>
            </form>
            <div className="copyright">
              <span> © 2025 Group1SE1818. All rights reserved.</span>
            </div>
            <div className="system-status">
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span className="status-text">
                  Hệ thống hoạt động bình thường
                </span>
                <span className="status-dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

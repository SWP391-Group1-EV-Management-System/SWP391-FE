// Trang đăng nhập - xác thực user và điều hướng vào hệ thống
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "../assets/styles/Login.css";
import { CgMail } from "react-icons/cg";
import { TbLock } from "react-icons/tb";
import { IoIosArrowForward } from "react-icons/io";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useLogin } from "../hooks/useAuth";

function Login() {
  // ===== STATE MANAGEMENT =====
  const [showPassword, setShowPassword] = useState(false);
  
  // ===== HOOKS =====
  const { login, loading, error } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Lấy đường dẫn đích sau khi đăng nhập thành công =====
  const from = location.state?.from || "/app/home";

  // ===== FUNCTION: Chuyển đổi hiển thị mật khẩu =====
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ===== FUNCTION: Quay về trang Welcome =====
  const handleBackToWelcome = () => {
    navigate("/welcome");
  };

  // ===== FUNCTION: Xử lý đăng nhập =====
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.username.value;
    const password = e.target.password.value;
    try {
      const success = await login(email, password, from);
      if (!success) {
        // Hook sẽ hiển thị lỗi
      }
    } catch (err) {
      // Xử lý lỗi
    }
  };

  // ===== RENDER UI =====
  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <div className="login-inner">
            {/* Nút quay lại trang Welcome */}
            <button
              className="back-to-welcome-btn"
              onClick={handleBackToWelcome}
              aria-label="Quay lại trang chính"
            >
              <IoClose size={24} />
            </button>
            
            {/* Tiêu đề trang */}
            <h2>Đăng nhập</h2>
            
            {/* Form đăng nhập */}
            <form onSubmit={handleLogin} aria-busy={loading}>
              {/* Trường nhập email */}
              <div>
                <label htmlFor="username">
                  <CgMail size={28} />
                  Gmail
                </label>
                <input
                  type="email"
                  id="username"
                  name="username"
                  required
                  placeholder="email@example.com"
                />
              </div>
              
              {/* Trường nhập mật khẩu với nút hiển thị/ẩn */}
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
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Checkbox nhớ mật khẩu và link quên mật khẩu */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" id="remember-password" />
                  <span className="checkmark"></span>
                  <span>Nhớ mật khẩu</span>
                </label>
                <a href="/forgot-password" className="forgot-password-link">
                  Quên mật khẩu?
                </a>
              </div>
              
              {/* Nút submit form đăng nhập */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  "Đang đăng nhập..."
                ) : (
                  <>
                    Đăng nhập <IoIosArrowForward size={24} />
                  </>
                )}
              </button>

              {/* Hiển thị thông báo lỗi nếu có */}
              {error && (
                <div
                  className="form-error"
                  role="alert"
                  style={{ color: "red", marginTop: 12 }}
                >
                  {error.message || String(error)}
                </div>
              )}

              {/* Link chuyển đến trang đăng ký */}
              <div className="register-prompt">
                <div>Không có tài khoản?</div>
                <a
                  href="/register"
                  className=""
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
            
            {/* Footer copyright */}
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

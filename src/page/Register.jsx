import React, { useState } from "react";
import { useNavigate } from "react-router";
import "../assets/styles/Register.css";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { FaUser, FaCalendarAlt, FaPhone } from "react-icons/fa";
import { PiGenderIntersexBold } from "react-icons/pi";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBackToWelcome = () => {
    navigate("/");
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Form submitted with data:", formData);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);
    console.log("Sending registration data:", formData);

    try {
      // Call API to register + send OTP
      console.log(
        "Making API call to:",
        "http://localhost:8080/users/register"
      );
      console.log("Request body:", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      const response = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      console.log("Response received:", response);
      console.log("Response status:", response.status);

      if (response.ok) {
        console.log(
          "Registration successful! OTP sent. Navigating to OTP page"
        );
        // Registration successful + OTP sent, redirect to OTP verification
        navigate("/otp-verification", {
          state: {
            email: formData.email,
            userData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              birthDate: formData.birthDate,
              gender: formData.gender === "true",
              phoneNumber: formData.phoneNumber,
              password: formData.password,
            },
          },
        });
      } else {
        console.log("Response not OK, status:", response.status);
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        setError(`Đăng ký thất bại: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Không thể kết nối đến server!");
    } finally {
      setIsLoading(false);
    }
  };

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
            <button
              className="back-to-welcome-btn"
              onClick={handleBackToWelcome}
              aria-label="Quay lại trang chính"
            >
              <IoClose size={24} />
            </button>
            <h2>Đăng ký</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Row 1: Email và Số điện thoại */}
              <div className="form-row">
                <div className="form-field half-width">
                  <label htmlFor="email">
                    <MdEmail size={28} />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-field half-width">
                  <label htmlFor="phoneNumber">
                    <FaPhone size={24} />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Row 2: Họ và Tên */}
              <div className="form-row">
                <div className="form-field half-width">
                  <label htmlFor="firstName">
                    <FaUser size={24} />
                    Họ
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ của bạn"
                  />
                </div>
                <div className="form-field half-width">
                  <label htmlFor="lastName">
                    <FaUser size={24} />
                    Tên
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên của bạn"
                  />
                </div>
              </div>

              {/* Row 3: Ngày sinh và Giới tính */}
              <div className="form-row">
                <div className="form-field half-width">
                  <label htmlFor="birthDate" className="birthdate-label">
                    <FaCalendarAlt size={24} />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field half-width">
                  <label htmlFor="gender">
                    <PiGenderIntersexBold size={28} />
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="gender-select"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Mật khẩu */}
              <div className="form-row">
                <div className="form-field half-width password-field">
                  <label htmlFor="password">
                    <FaLock size={24} />
                    Mật khẩu
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={20} />
                      ) : (
                        <IoEyeOutline size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-field half-width password-field">
                  <label htmlFor="confirmPassword">
                    <FaLock size={24} />
                    Xác nhận mật khẩu
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
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
              </div>
              <div className="form-options-register">
                <label className="checkbox-label">
                  <input type="checkbox" id="agree-terms" required />
                  <span className="checkmark"></span>
                  <span>
                    Tôi đồng ý với <a href="#">điều khoản sử dụng</a>
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="register-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}{" "}
                <IoIosArrowForward size={24} />
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

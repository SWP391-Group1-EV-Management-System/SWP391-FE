// Trang xác thực OTP - nhập mã OTP 6 số để hoàn tất đăng ký
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import "../assets/styles/OTPVerification.css";
import { IoClose, IoTime } from "react-icons/io5";
import { MdVerifiedUser } from "react-icons/md";

function OTPVerification() {
  // ===== STATE MANAGEMENT =====
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 1 phút = 60 giây
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // ===== HOOKS =====
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const inputRefs = useRef([]);

  // ===== EFFECT: Đếm ngược thời gian OTP =====
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // ===== FUNCTION: Format hiển thị thời gian =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ===== FUNCTION: Gửi lại mã OTP =====
  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/users/register",
        {
          email: email,
          firstName: location.state?.userData?.firstName || "",
          lastName: location.state?.userData?.lastName || "",
          birthDate: location.state?.userData?.birthDate || "",
          gender: location.state?.userData?.gender || false,
          phoneNumber: location.state?.userData?.phoneNumber || "",
          password: location.state?.userData?.password || "",
        }
      );

      setTimer(60); // Reset timer về 1 phút
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]); // Xóa OTP hiện tại
      setError("");
      // Focus vào ô nhập đầu tiên
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error.response) {
        setError("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
      } else {
        setError("Lỗi kết nối khi gửi lại OTP!");
      }
    } finally {
      setIsResending(false);
    }
  };

  // ===== FUNCTION: Xử lý thay đổi input OTP =====
  const handleInputChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ===== FUNCTION: Xử lý phím Backspace =====
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ===== FUNCTION: Xác thực OTP =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP 6 số!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/users/register/verify-otp",
        {
          email: email,
          otp: otpCode,
        }
      );

      alert("Xác thực thành công! Tài khoản đã được tạo.");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setError(`Mã OTP không đúng: ${error.response.data}`);
      } else {
        setError("Lỗi kết nối!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER UI =====
  return (
    <div className="otp-page">
      {/* Container chính */}
      <div className="otp-container">
        <div className="otp-inner">
          {/* Nút quay lại trang đăng ký */}
          <button
            className="back-btn"
            onClick={() => navigate("/register")}
            aria-label="Quay lại đăng ký"
          >
            <IoClose size={24} />
          </button>

          {/* Header với icon và tiêu đề */}
          <div className="otp-header">
            <MdVerifiedUser size={60} className="otp-icon" />
            <h2>Xác thực Email</h2>
            <p>
              Chúng tôi đã gửi mã xác thực 6 số đến email
              <br />
              <strong>{email || "Không có email"}</strong>
            </p>
          </div>

          {/* Hiển thị thông báo lỗi */}
          {error && <div className="error-message">{error}</div>}

          {/* Hiển thị cảnh báo nếu không có email */}
          {!email && (
            <div className="warning-message">
              Cảnh báo: Không tìm thấy email. Vui lòng đăng ký lại.
            </div>
          )}

          {/* Form xác thực OTP */}
          <form onSubmit={handleSubmit} className="otp-form">
            {/* Các ô nhập OTP */}
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Hiển thị thời gian đếm ngược */}
            <div className="timer-section">
              <IoTime size={16} />
              <span>Mã OTP sẽ hết hạn sau: {formatTime(timer)}</span>
            </div>

            {/* Nút xác thực */}
            <button
              type="submit"
              className="verify-button"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </button>

            {/* Phần gửi lại OTP */}
            <div className="resend-section">
              {canResend ? (
                <span>
                  Chưa nhận được mã?{" "}
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                  >
                    {isResending ? "Đang gửi..." : "Gửi lại"}
                  </button>
                </span>
              ) : (
                <span>
                  Chưa nhận được mã? Bạn có thể gửi lại sau{" "}
                  <strong>{formatTime(timer)}</strong>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;

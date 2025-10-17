import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import "../assets/styles/OTPVerification.css";
import { IoClose, IoTime } from "react-icons/io5";
import { MdVerifiedUser } from "react-icons/md";

function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 1 minute = 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const inputRefs = useRef([]);

  console.log("OTPVerification component loaded");
  console.log("Location state:", location.state);
  console.log("Email from location:", email);

  // Timer countdown effect
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

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");

    try {
      console.log("Resending OTP to:", email);
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

      console.log("OTP resent successfully");
      setTimer(60); // Reset timer to 1 minute
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]); // Clear current OTP
      setError("");
      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);
      if (error.response) {
        console.log("Resend OTP failed:", error.response.data);
        setError("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
      } else {
        setError("Lỗi kết nối khi gửi lại OTP!");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    console.log("OTP Verification - Submit started");
    console.log("Email:", email);
    console.log("OTP:", otpCode);
    console.log("OTP length:", otpCode.length);

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP 6 số!");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending OTP verification request...");
      const response = await axios.post(
        "http://localhost:8080/users/register/verify-otp",
        {
          email: email,
          otp: otpCode,
        }
      );

      console.log("OTP verification response status:", response.status);
      console.log("OTP verification response:", response.data);

      alert("Xác thực thành công! Tài khoản đã được tạo.");
      navigate("/login");
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response) {
        console.log("OTP verification failed:", error.response.data);
        setError(`Mã OTP không đúng: ${error.response.data}`);
      } else {
        setError("Lỗi kết nối!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-container">
        <div className="otp-inner">
          <button
            className="back-btn"
            onClick={() => navigate("/register")}
            aria-label="Quay lại đăng ký"
          >
            <IoClose size={24} />
          </button>

          <div className="otp-header">
            <MdVerifiedUser size={60} className="otp-icon" />
            <h2>Xác thực Email</h2>
            <p>
              Chúng tôi đã gửi mã xác thực 6 số đến email
              <br />
              <strong>{email || "Không có email"}</strong>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {!email && (
            <div className="warning-message">
              Cảnh báo: Không tìm thấy email. Vui lòng đăng ký lại.
            </div>
          )}

          <form onSubmit={handleSubmit} className="otp-form">
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

            {/* Timer section */}
            <div className="timer-section">
              <IoTime size={16} />
              <span>Mã OTP sẽ hết hạn sau: {formatTime(timer)}</span>
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </button>

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

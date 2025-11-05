import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Button, Alert } from "antd";
import {
  ThunderboltOutlined,
  UserOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Users } from "lucide-react";
import ShowQR from "../components/virtualstation/ShowQR";
import ShowSession from "../components/virtualstation/ShowSession";
import useChargingPostStatus from "../hooks/useChargingPostStatus";
import useChargingPost from "../hooks/useChargingPost";
import "../assets/styles/virtualstation/VirtualStationPage.css";
import "../assets/styles/virtualstation/PlugInButton.css";
import logo from "../assets/images/logo.png";

function VirtualStationPage() {
  const { postId } = useParams(); // Lấy postId từ URL
  const { status, isConnected } = useChargingPostStatus(postId); // WebSocket connection
  const { postData, loading: postLoading } = useChargingPost(postId); // Charging post info

  const [showQR, setShowQR] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Handler khi nhấn nút "CẮM SẠC"
  const handlePlugIn = () => {
    // ✅ Không check status nữa - Để backend xử lý và trả về lỗi nếu trụ bận
    // User có thể bấm nút bất kỳ lúc nào, backend sẽ validate
    setShowQR(true);
  };

  // Tự động chuyển sang ShowSession khi có session đang sạc từ WebSocket
  useEffect(() => {
    if (status?.status === "CHARGING" && status?.details?.sessionId) {
      console.log(
        "🎯 [VirtualStationPage] CHARGING detected, showing session:",
        status.details.sessionId
      );
      setCurrentSessionId(status.details.sessionId);
      setShowSession(true);
      setShowQR(false);
    } else if (status?.status === "AVAILABLE" && showSession) {
      // ✅ Khi trụ trở về AVAILABLE (session kết thúc) → back về nút CẮM SẠC
      console.log(
        "🏠 [VirtualStationPage] Status AVAILABLE, back to plug-in screen"
      );
      setShowSession(false);
      setShowQR(false);
      setCurrentSessionId(null);
    }
  }, [status, showSession]);

  // Lắng nghe sự kiện khi session được tạo từ QR scan
  useEffect(() => {
    const handleSessionCreated = (event) => {
      const { sessionId } = event.detail;
      console.log(
        "🎯 [VirtualStationPage] Session created from QR:",
        sessionId
      );
      setCurrentSessionId(sessionId);
      setShowSession(true);
      setShowQR(false);
    };

    window.addEventListener("sessionCreated", handleSessionCreated);

    return () => {
      window.removeEventListener("sessionCreated", handleSessionCreated);
    };
  }, []);

  // Hàm lấy thông tin hiển thị theo trạng thái
  const getStatusInfo = () => {
    // Nếu chưa có status từ WebSocket, mặc định cho phép sử dụng
    if (!status) {
      return {
        color: "#10b981",
        icon: <LoadingOutlined style={{ fontSize: "24px", color: "#10b981" }} />,
        message: isConnected ? "Đang tải trạng thái..." : "Đang kết nối...",
        canPlugIn: true, // ✅ Cho phép cắm sạc khi chưa có status
      };
    }

    switch (status.status) {
      case "AVAILABLE":
        return {
          color: "#10b981",
          icon: <CheckCircleOutlined style={{ fontSize: "24px", color: "#10b981" }} />,
          message: "Trụ rảnh - Sẵn sàng sử dụng",
          canPlugIn: true,
        };

      case "WAITING":
        return {
          color: "#eab308",
          icon: <Users size={24} color="#eab308" />,
          message: `Có ${status.waitingCount || 0} người đang chờ`,
          canPlugIn: true,
        };

      case "BOOKED":
        return {
          color: "#f59e0b",
          icon: <ClockCircleOutlined style={{ fontSize: "24px", color: "#f59e0b" }} />,
          message: `ĐÃ CÓ NGƯỜI BOOKING TRƯỚC`,
          subtitle: `Người đặt: ${status.details?.userName || "Unknown"}`,
          canPlugIn: true, // ✅ Cho phép bấm, backend sẽ kiểm tra và báo lỗi
        };

      case "CHARGING":
        return {
          color: "#ef4444",
          icon: <ThunderboltOutlined style={{ fontSize: "24px", color: "#ef4444" }} />,
          message: "Đang có người sạc",
          subtitle: `Người sạc: ${status.details?.userName || "Unknown"}`,
          canPlugIn: true, // ✅ Cho phép bấm, backend sẽ kiểm tra và báo lỗi
        };

      default:
        return {
          color: "#6b7280",
          icon: <QuestionCircleOutlined style={{ fontSize: "24px", color: "#6b7280" }} />,
          message: "Trạng thái không xác định",
          canPlugIn: true, // ✅ Mặc định cho phép nếu không xác định
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      {!showQR && !showSession ? (
        // Bước 1: Hiển thị nút "CẮM SẠC" với trạng thái real-time
        <div className="plugin-container">
          <div className="plugin-card">
            {/* Connection indicator */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: isConnected ? "#10b981" : "#ef4444",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected ? "#10b981" : "#ef4444",
                  animation: isConnected ? "pulse 2s infinite" : "none",
                }}
              />
              <span>{isConnected ? "Online" : "Offline"}</span>
            </div>

            <img src={logo} alt="Eco-Z" />

            {/* Status Alert */}
            {status && (
              <Alert
                type={
                  status.status === "AVAILABLE"
                    ? "success"
                    : status.status === "WAITING"
                    ? "warning"
                    : status.status === "BOOKED"
                    ? "error"
                    : status.status === "CHARGING"
                    ? "error"
                    : "info"
                }
                message={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {statusInfo.icon}
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {statusInfo.message}
                      </div>
                      {statusInfo.subtitle && (
                        <div style={{ fontSize: "12px", marginTop: "4px" }}>
                          {statusInfo.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                }
                style={{ marginBottom: "20px" }}
                showIcon={false}
              />
            )}

            <h1 className="plugin-title">
              {statusInfo.canPlugIn ? "Sẵn sàng sạc" : "Trụ đang bận"}
            </h1>

            {/* ✅ Hiển thị thông tin trụ sạc từ postData */}
            {postData && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  <strong>Công suất tối đa:</strong> {postData.maxPower} kW
                </div>
                <div>
                  <strong>Giá sạc:</strong>{" "}
                  {postData.chargingFeePerKWh.toLocaleString()} VNĐ/kWh
                </div>
              </div>
            )}

            <p className="plugin-description">
              {statusInfo.canPlugIn
                ? "Vui lòng cắm dây sạc vào xe trước khi tiếp tục"
                : "Vui lòng chọn trụ sạc khác hoặc chờ đến khi trụ này rảnh"}
            </p>

            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={handlePlugIn}
              className="plugin-button"
              disabled={!statusInfo.canPlugIn}
              style={{
                backgroundColor: statusInfo.canPlugIn ? undefined : "#d1d5db",
                borderColor: statusInfo.canPlugIn ? undefined : "#d1d5db",
              }}
            >
              {statusInfo.canPlugIn ? "CẮM SẠC" : "KHÔNG KHẢ DỤNG"}
            </Button>

            {/* Hiển thị waiting count nếu có */}
            {status?.waitingCount > 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ fontSize: "16px", color: "#92400e" }} />
                <span style={{ color: "#92400e", fontWeight: "500" }}>
                  {status.waitingCount} người đang chờ
                </span>
              </div>
            )}
          </div>
        </div>
      ) : showQR ? (
        // Bước 2: Sau khi nhấn nút, hiển thị QR code
        <ShowQR />
      ) : (
        // Bước 3: Sau khi scan QR và tạo session, hiển thị trạng thái sạc
        <ShowSession sessionId={currentSessionId} isPublic={true} />
      )}
    </>
  );
}

export default VirtualStationPage;

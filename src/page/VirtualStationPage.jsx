// Trang trạm ảo (Public) - hiển thị QR và quản lý phiên sạc cho trụ công cộng
import React, { useState, useEffect, useRef } from "react";
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
  const { postId } = useParams(); // Lấy ID trụ sạc từ URL
  const { status, isConnected } = useChargingPostStatus(postId); // Kết nối WebSocket
  const { postData, loading: postLoading } = useChargingPost(postId); // Thông tin trụ sạc

  const [showQR, setShowQR] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const allowUnloadRef = useRef(true);
  const storageKey = `virtualStationState_${postId}`;

  // Callback khi phiên sạc kết thúc
  const handleSessionFinishedFromChild = () => {
    try {
      allowUnloadRef.current = false;
      sessionStorage.removeItem(storageKey);
    } catch (err) {
      // ignore
    }

    // Reset UI về màn hình cắm sạc
    setShowSession(false);
    setShowQR(false);
    setCurrentSessionId(null);

    // Bật lại cảnh báo reload sau 2s
    setTimeout(() => {
      allowUnloadRef.current = true;
    }, 2000);
  };

  // Xử lý khi nhấn nút "CẮM SẠC"
  const handlePlugIn = () => {
    setShowQR(true);
  };

  // Tự động chuyển sang màn hình sạc khi có session đang hoạt động
  useEffect(() => {
    if (status?.status === "CHARGING" && status?.details?.sessionId) {
      console.log("🎯 CHARGING detected, showing session:", status.details.sessionId);
      setCurrentSessionId(status.details.sessionId);
      setShowSession(true);
      setShowQR(false);
    } else if (status?.status === "AVAILABLE" && showSession) {
      console.log("🏠 Status AVAILABLE, back to plug-in screen");
      setShowSession(false);
      setShowQR(false);
      setCurrentSessionId(null);
    }
  }, [status, showSession]);

  // Lắng nghe sự kiện session được tạo từ QR scan
  useEffect(() => {
    const handleSessionCreated = (event) => {
      const { sessionId } = event.detail;
      console.log("🎯 Session created from QR:", sessionId);
      setCurrentSessionId(sessionId);
      setShowSession(true);
      setShowQR(false);
    };

    window.addEventListener("sessionCreated", handleSessionCreated);

    return () => {
      window.removeEventListener("sessionCreated", handleSessionCreated);
    };
  }, []);

  // Khôi phục trạng thái UI từ sessionStorage (chống mất dữ liệu khi reload)
  useEffect(() => {
    try {
      const key = `virtualStationState_${postId}`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.currentSessionId) setCurrentSessionId(parsed.currentSessionId);
          if (parsed.showSession) setShowSession(true);
          if (parsed.showQR) setShowQR(true);
        }
      }
    } catch (err) {
      // ignore
    }
  }, [postId]);

  // Lưu trạng thái UI vào sessionStorage
  useEffect(() => {
    try {
      const key = `virtualStationState_${postId}`;
      const payload = {
        showQR,
        showSession,
        currentSessionId,
        ts: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      // ignore
    }
  }, [postId, showQR, showSession, currentSessionId]);

  // Bảo vệ trang khỏi reload: hiển thị cảnh báo và chặn F5/Ctrl+R
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!allowUnloadRef.current) return undefined;
      e.preventDefault();
      e.returnValue = "Bạn có chắc muốn rời trang? Phiên public này có thể bị gián đoạn.";
      return e.returnValue;
    };

    const handleKeyDownPreventRefresh = (e) => {
      if (!allowUnloadRef.current) return;
      const key = e.key;
      if (key === "F5" || ((e.ctrlKey || e.metaKey) && (key === "r" || key === "R"))) {
        e.preventDefault();
        e.stopPropagation();
        console.log("[VirtualStationPage] Refresh prevented (F5/Ctrl+R/Cmd+R)");
      }
    };

    const handleContextMenu = (e) => {
      if (!allowUnloadRef.current) return;
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDownPreventRefresh);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDownPreventRefresh);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [postId]);

  // Ngăn reload toàn phần: bắt sự kiện beforeunload (kích hoạt khi user click reload hoặc đóng tab)
  // và khóa phím F5 / Ctrl+R / Cmd+R. Người dùng vẫn có thể dùng nút reload nhưng browser
  // sẽ hiển thị hộp thoại xác nhận — đây là giới hạn của trình duyệt.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!allowUnloadRef.current) return undefined;
      // Chuẩn: set returnValue để kích hoạt cảnh báo xác nhận reload
      e.preventPrevent();
      e.returnValue =
        "Bạn có chắc muốn rời trang? Phiên public này có thể bị gián đoạn.";
      return e.returnValue;
    };

    const handleKeyDownPreventRefresh = (e) => {
      if (!allowUnloadRef.current) return;
      const key = e.key;
      if (
        key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (key === "r" || key === "R"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        // Optional: small feedback
        console.log("[VirtualStationPage] Refresh prevented (F5/Ctrl+R/Cmd+R)");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDownPreventRefresh);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDownPreventRefresh);
    };
  }, []);

  // (redundant) extra keyboard handler — keep but respect allowUnloadRef
  useEffect(() => {
    const handleKeyDownPreventRefresh = (e) => {
      if (!allowUnloadRef.current) return;
      const key = e.key;
      // F5 or Ctrl+R / Cmd+R
      if (
        key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (key === "r" || key === "R"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        // Optional: show a small feedback in console
        console.log("[VirtualStationPage] Refresh prevented (F5/Ctrl+R/Cmd+R)");
      }
    };

    window.addEventListener("keydown", handleKeyDownPreventRefresh);

    return () => {
      window.removeEventListener("keydown", handleKeyDownPreventRefresh);
    };
  }, []);

  // Hàm lấy thông tin hiển thị theo trạng thái
  const getStatusInfo = () => {
    // Nếu chưa có status từ WebSocket, mặc định cho phép sử dụng
    if (!status) {
      return {
        color: "#10b981",
        icon: (
          <LoadingOutlined style={{ fontSize: "24px", color: "#10b981" }} />
        ),
        message: isConnected ? "Đang tải trạng thái..." : "Đang kết nối...",
        canPlugIn: true, // ✅ Cho phép cắm sạc khi chưa có status
      };
    }

    switch (status.status) {
      case "AVAILABLE":
        return {
          color: "#10b981",
          icon: (
            <CheckCircleOutlined
              style={{ fontSize: "24px", color: "#10b981" }}
            />
          ),
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
          icon: (
            <ClockCircleOutlined
              style={{ fontSize: "24px", color: "#f59e0b" }}
            />
          ),
          message: `ĐÃ CÓ NGƯỜI BOOKING TRƯỚC`,
          subtitle: `Người đặt: ${status.details?.userName || "Unknown"}`,
          canPlugIn: true, // ✅ Cho phép bấm, backend sẽ kiểm tra và báo lỗi
        };

      case "CHARGING":
        return {
          color: "#ef4444",
          icon: (
            <ThunderboltOutlined
              style={{ fontSize: "24px", color: "#ef4444" }}
            />
          ),
          message: "Đang có người sạc",
          subtitle: `Người sạc: ${status.details?.userName || "Unknown"}`,
          canPlugIn: true, // ✅ Cho phép bấm, backend sẽ kiểm tra và báo lỗi
        };

      default:
        return {
          color: "#6b7280",
          icon: (
            <QuestionCircleOutlined
              style={{ fontSize: "24px", color: "#6b7280" }}
            />
          ),
          message: "Trạng thái không xác định",
          canPlugIn: true, // ✅ Mặc định cho phép nếu không xác định
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      {!showQR && !showSession ? (
        // Bước 1: Màn hình nút "CẮM SẠC"
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
        // Bước 2: Màn hình hiển thị QR code
        <ShowQR />
      ) : (
        // Bước 3: Màn hình theo dõi phiên sạc
        <ShowSession
          sessionId={currentSessionId}
          isPublic={true}
          onSessionFinished={handleSessionFinishedFromChild}
        />
      )}
    </>
  );
}

export default VirtualStationPage;

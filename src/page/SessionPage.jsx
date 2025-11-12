import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import { useEnergySession } from "../hooks/useEnergySession";
import { useAuth } from "../hooks/useAuth";
import { usePaymentData } from "../hooks/usePayment";
import {
  ThunderboltOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const EnergyPage = ({ userID }) => {
  const navigate = useNavigate();
  
  // ==================== HOOKS ====================
  const { user, loading: authLoading } = useAuth();
  const { fetchUnpaidPaymentsByUserId } = usePaymentData();
  const {
    sessionData,
    currentTime,
    statusConfig,
    isLoading,
    isFinishing,
    error,
    errorCode,
    finishSession,
    refetch,
  } = useEnergySession(userID);

  // ==================== STATE MANAGEMENT ====================
  const [realtimeProgress, setRealtimeProgress] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [batteryCountdownInfo, setBatteryCountdownInfo] = useState(null);

  // ==================== LẤY THÔNG TIN BATTERY COUNTDOWN TỪ LOCALSTORAGE ====================
  useEffect(() => {
    const countdownData = localStorage.getItem("batteryCountdown");
    if (countdownData) {
      try {
        const parsed = JSON.parse(countdownData);
        setBatteryCountdownInfo(parsed);
      } catch (error) {
        console.error("Error parsing battery countdown:", error);
      }
    }
  }, [sessionData?.chargingSessionId]);

  // ==================== KIỂM TRA TRẠNG THÁI THANH TOÁN ====================
  useEffect(() => {
    if (sessionData?.chargingSessionId) {
      const paidSessionsStr = localStorage.getItem("paidSessions");
      const paidSessions = JSON.parse(paidSessionsStr || "{}");

      if (paidSessions[sessionData.chargingSessionId]) {
        setIsPaid(true);
      } else {
        setIsPaid(false);
      }
    }
  }, [sessionData?.chargingSessionId]);

  // ==================== KẾT NỐI SSE ĐỂ NHẬN DỮ LIỆU REALTIME ====================
  useEffect(() => {
    const sessionId = sessionData?.chargingSessionId || sessionData?.sessionId;

    if (!sessionId || !sessionData) {
      return;
    }

    let eventSource = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectSSE = () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        eventSource = new EventSource(
          `${apiUrl}/api/charging/session/progress/${sessionId}`,
          { withCredentials: true }
        );

        // Lắng nghe sự kiện "chargingProgress"
        eventSource.addEventListener("chargingProgress", (event) => {
          try {
            const progress = JSON.parse(event.data);
            reconnectAttempts = 0;

            const energyStr = progress.chargedEnergy_kWh || "0";
            const energyCharged = parseFloat(energyStr.replace(",", ".")) || 0;

            const elapsedSec = parseInt(progress.elapsedSeconds || "0", 10);
            const batteryLevel = parseInt(progress.pin || "0", 10);
            const targetPin = parseInt(progress.targetPin || "100", 10);
            const secondRemaining = parseInt(progress.secondRemaining || "0", 10);
            const maxSeconds = parseInt(progress.maxSeconds || "0", 10);

            const hours = Math.floor(elapsedSec / 3600);
            const minutes = Math.floor((elapsedSec % 3600) / 60);
            const seconds = elapsedSec % 60;

            const timeElapsed =
              hours > 0
                ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
                : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            setRealtimeProgress({
              energyCharged,
              timeElapsed,
              batteryLevel,
              targetPin,
              secondRemaining,
              maxSeconds,
            });
          } catch (error) {
            console.error("Error parsing SSE progress data:", error);
          }
        });

        // Xử lý lỗi SSE
        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttempts);
          }
        };
      } catch (error) {
        console.error("Failed to create SSE connection:", error);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [sessionData?.chargingSessionId, sessionData?.sessionId, sessionData]);

  // ==================== KIỂM TRA SESSION KẾT THÚC ====================
  useEffect(() => {
    if (!isLoading && !sessionData && !error) {
      console.log("Session đã kết thúc");
    }
  }, [sessionData, isLoading, error]);

  // ==================== LẮNG NGHE SỰ KIỆN SESSION CREATED ====================
  useEffect(() => {
    const handleSessionCreated = (e) => {
      try {
        refetch();
      } catch (err) {
        console.warn("Error refetching after sessionCreated:", err);
      }
    };

    window.addEventListener("sessionCreated", handleSessionCreated);
    return () => window.removeEventListener("sessionCreated", handleSessionCreated);
  }, [refetch]);

  // ==================== LẮNG NGHE SỰ KIỆN THANH TOÁN THÀNH CÔNG ====================
  useEffect(() => {
    const handlePaymentSuccess = (e) => {
      const { sessionId } = e?.detail || {};

      if (sessionId && sessionId === sessionData?.chargingSessionId) {
        const paidSessions = JSON.parse(localStorage.getItem("paidSessions") || "{}");
        paidSessions[sessionId] = {
          paidAt: new Date().toISOString(),
          timestamp: Date.now(),
        };
        localStorage.setItem("paidSessions", JSON.stringify(paidSessions));

        setIsPaid(true);
        localStorage.removeItem("pendingPayment");

        notification.success({
          message: "Thanh toán thành công",
          description: "Phiên sạc đã được thanh toán.",
        });
      }
    };

    window.addEventListener("paymentSuccess", handlePaymentSuccess);

    return () => {
      window.removeEventListener("paymentSuccess", handlePaymentSuccess);
    };
  }, [sessionData?.chargingSessionId]);

  // ==================== XỬ LÝ THANH TOÁN ====================
  const handlePayment = async () => {
    if (!user?.id) {
      notification.error({
        message: "Lỗi xác thực",
        description: "Không tìm thấy thông tin người dùng.",
      });
      return;
    }

    try {
      const unpaidPayments = await fetchUnpaidPaymentsByUserId(user.id);

      if (unpaidPayments && unpaidPayments.length > 0) {
        let targetPayment = unpaidPayments.find(
          (p) =>
            p.sessionId === sessionData?.chargingSessionId ||
            p.chargingSessionId === sessionData?.chargingSessionId ||
            p.session?.chargingSessionId === sessionData?.chargingSessionId
        );

        if (!targetPayment) {
          targetPayment = unpaidPayments[0];
        }

        const paymentId = targetPayment.paymentId || targetPayment.id;
        const sessionIdToSave = targetPayment.sessionId || sessionData?.chargingSessionId;

        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            sessionId: sessionIdToSave,
            paymentId: paymentId,
            timestamp: Date.now(),
          })
        );

        navigate(`/app/payment/${paymentId}`);
      } else {
        notification.info({
          message: "Không có thanh toán",
          description: "Bạn không có thanh toán nào cần hoàn thành.",
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thông tin thanh toán. Vui lòng thử lại.",
      });
    }
  };

  // ==================== TRẠNG THÁI LOADING ====================
  if (isLoading || authLoading) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" spinning={true} tip="Đang tải thông tin phiên sạc...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== TRẠNG THÁI KHÔNG CÓ QUYỀN ====================
  const isForbidden =
    !user ||
    (sessionData &&
      user.id !== sessionData.userId &&
      user.role !== "ADMIN" &&
      user.role !== "MANAGER") ||
    errorCode === 403;

  if (isForbidden) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          {/* Icon khóa */}
          <LockOutlined
            style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }}
          />
          
          {/* Thông báo lỗi */}
          <Alert
            message="Không có quyền truy cập"
            description={
              <div>
                <p>Bạn không có quyền truy cập phiên sạc này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Phiên sạc này có thể thuộc về người dùng khác hoặc bạn không có quyền xem.
                </p>
              </div>
            }
            type="error"
            showIcon={false}
            style={{ marginBottom: "20px" }}
          />
          
          {/* Các nút hành động */}
          <Space>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => {
                localStorage.removeItem("currentSessionId");
                navigate("/app/home");
              }}
            >
              Về trang chủ
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem("currentSessionId");
                refetch();
              }}
            >
              Thử lại
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // ==================== TRẠNG THÁI LỖI ====================
  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {/* Thông báo lỗi */}
        <Alert
          message="Lỗi tải dữ liệu"
          description={
            <div>
              <p>{error}</p>
              {errorCode && (
                <p style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                  Mã lỗi: {errorCode}
                </p>
              )}
            </div>
          }
          type="error"
          showIcon
          closable
          action={
            <Button size="small" onClick={refetch}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // ==================== TRẠNG THÁI KHÔNG CÓ SESSION ====================
  if (!sessionData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {/* Thông báo không có session */}
        <Alert
          message="Không có phiên sạc"
          description="Hiện tại không có phiên sạc nào đang hoạt động"
          type="info"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={() => navigate("/app/map")}>
                Tìm trạm sạc
              </Button>
              <Button size="small" onClick={refetch}>
                Tải lại
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // ==================== GIAO DIỆN CHÍNH ====================
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header trang */}
          <PageHeader
            title={sessionData.stationName || "Trạm sạc"}
            icon={<ThunderboltOutlined />}
            subtitle={sessionData.address || ""}
            statusTag={
              statusConfig
                ? {
                    color: statusConfig.color,
                    icon: statusConfig.icon,
                    text: statusConfig.text,
                  }
                : null
            }
          />

          {/* Hàng 1: Tiến trình pin & Thời gian hiện tại */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BatteryProgress
                batteryLevel={
                  realtimeProgress?.batteryLevel ||
                  sessionData.batteryLevel ||
                  0
                }
                isCharging={statusConfig?.isCharging || false}
                isCompleted={statusConfig?.isCompleted || false}
              />
            </Col>

            <Col xs={24} lg={12}>
              <CurrentTime
                currentTime={
                  sessionData.expectedEndTime
                    ? new Date(sessionData.expectedEndTime)
                    : currentTime
                }
                sessionData={{
                  ...sessionData,
                  secondRemaining: realtimeProgress?.secondRemaining,
                  maxSeconds: realtimeProgress?.maxSeconds,
                }}
              />
            </Col>
          </Row>

          {/* Thống kê năng lượng */}
          <EnergyStats
            sessionData={sessionData}
            realtimeProgress={realtimeProgress}
          />

          {/* Hàng 2: Chi tiết kỹ thuật & Thông tin giá */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>

            <Col xs={24} lg={12}>
              <PricingInfo
                finishSession={finishSession}
                isFinishing={isFinishing}
                sessionData={sessionData}
                onPay={handlePayment}
                isPaid={isPaid}
              />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;

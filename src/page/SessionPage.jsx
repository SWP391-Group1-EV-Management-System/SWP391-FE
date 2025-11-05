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
import { useBatteryCountdown } from "../hooks/useBatteryCountdown";
import {
  ThunderboltOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const EnergyPage = ({ userID }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // ✅ Thêm payment hook để lấy unpaid payments
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

  // ✅ State để lưu dữ liệu realtime từ SSE
  const [realtimeProgress, setRealtimeProgress] = useState(null);

  // ✅ State để theo dõi trạng thái thanh toán
  const [isPaid, setIsPaid] = useState(false);

  // ✅ Lấy thông tin battery countdown từ localStorage
  const [batteryCountdownInfo, setBatteryCountdownInfo] = useState(null);

  useEffect(() => {
    const countdownData = localStorage.getItem("batteryCountdown");
    if (countdownData) {
      try {
        const parsed = JSON.parse(countdownData);
        setBatteryCountdownInfo(parsed);
        console.log("🔋 [SessionPage] Loaded battery countdown info:", parsed);
      } catch (error) {
        console.error(
          "❌ [SessionPage] Error parsing battery countdown:",
          error
        );
      }
    }
  }, [sessionData?.chargingSessionId]);

  // ✅ Sử dụng battery countdown hook
  const {
    batteryLevel: countdownBatteryLevel,
    remainingSeconds,
    displayTime,
    status: countdownStatus,
    isCompleted: countdownCompleted,
  } = useBatteryCountdown(
    batteryCountdownInfo?.currentBattery,
    batteryCountdownInfo?.remainingMinutes,
    !!batteryCountdownInfo && !sessionData?.isDone // Chỉ active khi có data và session chưa done
  );

  // ✅ Debug log để kiểm tra hook hoạt động
  useEffect(() => {
    console.log("🔍 [SessionPage] Battery Countdown Debug:", {
      batteryCountdownInfo,
      countdownBatteryLevel,
      remainingSeconds,
      displayTime,
      countdownStatus,
      isActive: !!batteryCountdownInfo && !sessionData?.isDone,
    });
  }, [
    batteryCountdownInfo,
    countdownBatteryLevel,
    remainingSeconds,
    displayTime,
    countdownStatus,
    sessionData?.isDone,
  ]);

  // ✅ Kiểm tra trạng thái thanh toán khi sessionData thay đổi
  useEffect(() => {
    if (sessionData?.chargingSessionId) {
      console.log(
        "🔍 [SessionPage] Checking payment status for session:",
        sessionData.chargingSessionId
      );

      // Kiểm tra localStorage xem session này đã thanh toán chưa
      const paidSessionsStr = localStorage.getItem("paidSessions");
      console.log(
        "📦 [SessionPage] paidSessions from localStorage:",
        paidSessionsStr
      );

      const paidSessions = JSON.parse(paidSessionsStr || "{}");

      if (paidSessions[sessionData.chargingSessionId]) {
        console.log(
          "✅ [SessionPage] Session already paid:",
          paidSessions[sessionData.chargingSessionId]
        );
        setIsPaid(true);
      } else {
        console.log("⚠️ [SessionPage] Session not paid yet");
        setIsPaid(false);
      }
    }
  }, [sessionData?.chargingSessionId]);

  // ✅ Kết nối SSE để nhận dữ liệu realtime
  useEffect(() => {
    const sessionId = sessionData?.chargingSessionId || sessionData?.sessionId;

    if (!sessionId || !sessionData) {
      console.log("⚠️ No sessionId or sessionData, skipping SSE connection");
      return;
    }

    let eventSource = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectSSE = () => {
      try {
        // ✅ Cookie-based auth: EventSource tự động gửi cookies (jwt) nếu cùng origin
        // Không cần token từ localStorage vì backend đọc JWT từ cookie
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        eventSource = new EventSource(
          `${apiUrl}/api/charging/session/progress/${sessionId}`,
          { withCredentials: true } // ✅ Quan trọng: cho phép gửi cookies cross-origin
        );

        console.log("🔌 [SessionPage] SSE connected for session:", sessionId);

        // Lắng nghe sự kiện "chargingProgress"
        eventSource.addEventListener("chargingProgress", (event) => {
          try {
            const progress = JSON.parse(event.data);

            // Reset reconnect attempts on successful message
            reconnectAttempts = 0;

            // ✅ Backend trả về: chargedEnergy_kWh, elapsedSeconds, pin, minuteMax
            // Parse và chuyển đổi sang format FE cần
            const energyStr = progress.chargedEnergy_kWh || "0";
            const energyCharged = parseFloat(energyStr.replace(",", ".")) || 0;

            const elapsedSec = parseInt(progress.elapsedSeconds || "0", 10);

            // ✅ Parse battery level và max minutes từ backend
            const batteryLevel = parseInt(progress.pin || "0", 10);
            const maxMinutes = parseInt(progress.minuteMax || "0", 10);

            // Chuyển seconds thành HH:MM:SS hoặc MM:SS
            const hours = Math.floor(elapsedSec / 3600);
            const minutes = Math.floor((elapsedSec % 3600) / 60);
            const seconds = elapsedSec % 60;

            const timeElapsed =
              hours > 0
                ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
                    2,
                    "0"
                  )}:${String(seconds).padStart(2, "0")}`
                : `${String(minutes).padStart(2, "0")}:${String(
                    seconds
                  ).padStart(2, "0")}`;

            console.log("🔋 [SessionPage] SSE Progress:", {
              energyCharged,
              timeElapsed,
              batteryLevel,
              maxMinutes,
            });

            setRealtimeProgress({
              energyCharged,
              timeElapsed,
              batteryLevel,
              maxMinutes,
            });
          } catch (error) {
            console.error("❌ Error parsing SSE progress data:", error);
          }
        });

        // Xử lý lỗi
        eventSource.onerror = (error) => {
          console.error("❌ SSE connection error:", error);

          // Đóng connection hiện tại
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Retry nếu chưa quá số lần thử
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(
              `🔄 Reconnecting SSE (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`
            );
            setTimeout(() => {
              connectSSE();
            }, 2000 * reconnectAttempts); // Exponential backoff: 2s, 4s, 6s
          } else {
            console.warn(
              "⚠️ Max SSE reconnect attempts reached. Stopping reconnection."
            );
          }
        };
      } catch (error) {
        console.error("❌ Failed to create SSE connection:", error);
      }
    };

    // Khởi tạo connection
    connectSSE();

    // Cleanup: đóng kết nối khi component unmount hoặc sessionId thay đổi
    return () => {
      console.log(
        "🔌 [SessionPage] Closing SSE connection for session:",
        sessionId
      );
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [sessionData?.chargingSessionId, sessionData?.sessionId, sessionData]);

  useEffect(() => {
    if (!isLoading && !sessionData && !error) {
      console.log("Session đã kết thúc");
    }
  }, [sessionData, isLoading, error]);

  // Listen for sessionCreated events to refetch if the session was created
  // elsewhere in the app (e.g. QR modal). This ensures the page refreshes
  // its data when a new session is started.
  useEffect(() => {
    const handleSessionCreated = (e) => {
      console.log("sessionCreated event received:", e?.detail);
      try {
        refetch();
      } catch (err) {
        console.warn("Error refetching after sessionCreated:", err);
      }
    };

    window.addEventListener("sessionCreated", handleSessionCreated);
    return () =>
      window.removeEventListener("sessionCreated", handleSessionCreated);
  }, [refetch]);

  // ✅ Listen for payment success event
  useEffect(() => {
    const handlePaymentSuccess = (e) => {
      const { sessionId } = e?.detail || {};
      console.log("💰 [SessionPage] Payment success event received");
      console.log("💰 [SessionPage] Event sessionId:", sessionId);
      console.log(
        "💰 [SessionPage] Current sessionData.chargingSessionId:",
        sessionData?.chargingSessionId
      );

      if (sessionId && sessionId === sessionData?.chargingSessionId) {
        console.log("✅ [SessionPage] SessionId matches! Marking as paid");

        // Lưu vào localStorage
        const paidSessions = JSON.parse(
          localStorage.getItem("paidSessions") || "{}"
        );
        paidSessions[sessionId] = {
          paidAt: new Date().toISOString(),
          timestamp: Date.now(),
        };
        localStorage.setItem("paidSessions", JSON.stringify(paidSessions));
        console.log("✅ [SessionPage] Saved to paidSessions:", paidSessions);

        // Cập nhật state
        setIsPaid(true);
        console.log("✅ [SessionPage] isPaid set to true");

        // Xóa pending payment
        localStorage.removeItem("pendingPayment");

        notification.success({
          message: "Thanh toán thành công",
          description: "Phiên sạc đã được thanh toán.",
        });
      } else {
        console.warn("⚠️ [SessionPage] SessionId mismatch or missing");
      }
    };

    console.log("🎧 [SessionPage] Registering paymentSuccess event listener");
    window.addEventListener("paymentSuccess", handlePaymentSuccess);

    return () => {
      console.log("🎧 [SessionPage] Removing paymentSuccess event listener");
      window.removeEventListener("paymentSuccess", handlePaymentSuccess);
    };
  }, [sessionData?.chargingSessionId]);

  // ✅ Handler thanh toán - Lấy payment và navigate
  const handlePayment = async () => {
    if (!user?.id) {
      notification.error({
        message: "Lỗi xác thực",
        description: "Không tìm thấy thông tin người dùng.",
      });
      return;
    }

    try {
      // ✅ Gọi API lấy danh sách payment chưa thanh toán
      const unpaidPayments = await fetchUnpaidPaymentsByUserId(user.id);

      console.log("✅ [SessionPage] Unpaid payments:", unpaidPayments);

      if (unpaidPayments && unpaidPayments.length > 0) {
        // ✅ Tìm payment tương ứng với session hiện tại
        let targetPayment = unpaidPayments.find(
          (p) =>
            p.sessionId === sessionData?.chargingSessionId ||
            p.chargingSessionId === sessionData?.chargingSessionId ||
            p.session?.chargingSessionId === sessionData?.chargingSessionId
        );

        // Nếu không tìm thấy, lấy payment đầu tiên
        if (!targetPayment) {
          targetPayment = unpaidPayments[0];
          console.log(
            "⚠️ [SessionPage] Session payment not found, using first unpaid payment"
          );
        }

        // Lấy paymentId (có thể là paymentId hoặc id)
        const paymentId = targetPayment.paymentId || targetPayment.id;
        const sessionIdToSave =
          targetPayment.sessionId || sessionData?.chargingSessionId;

        console.log("✅ [SessionPage] Navigating to payment:", paymentId);
        console.log(
          "✅ [SessionPage] Saving sessionId to pendingPayment:",
          sessionIdToSave
        );

        // ✅ Lưu thông tin vào localStorage để track payment này
        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            sessionId: sessionIdToSave,
            paymentId: paymentId,
            timestamp: Date.now(),
          })
        );

        console.log(
          "✅ [SessionPage] pendingPayment saved:",
          localStorage.getItem("pendingPayment")
        );

        navigate(`/app/payment/${paymentId}`);
      } else {
        console.warn("⚠️ [SessionPage] No unpaid payments found");
        notification.info({
          message: "Không có thanh toán",
          description: "Bạn không có thanh toán nào cần hoàn thành.",
        });
      }
    } catch (error) {
      console.error("❌ [SessionPage] Error fetching payments:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thông tin thanh toán. Vui lòng thử lại.",
      });
    }
  };

  // ==================== LOADING STATE ====================
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
        <Spin
          size="large"
          spinning={true}
          tip="Đang tải thông tin phiên sạc..."
        >
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== FORBIDDEN STATE (403) ====================
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
          <LockOutlined
            style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }}
          />
          <Alert
            message="Không có quyền truy cập"
            description={
              <div>
                <p>Bạn không có quyền truy cập phiên sạc này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Phiên sạc này có thể thuộc về người dùng khác hoặc bạn không
                  có quyền xem.
                </p>
              </div>
            }
            type="error"
            showIcon={false}
            style={{ marginBottom: "20px" }}
          />
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

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Lỗi tải dữ liệu"
          description={
            <div>
              <p>{error}</p>
              {errorCode && (
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}
                >
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

  // ==================== NO SESSION STATE ====================
  if (!sessionData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
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

  // ==================== MAIN CONTENT ====================
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
          {/* Header */}
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

          {/* Row 1: Battery & Current Time */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BatteryProgress
                batteryLevel={
                  countdownBatteryLevel || sessionData.batteryLevel || 0
                }
                isCharging={statusConfig?.isCharging || false}
                isCompleted={
                  countdownCompleted || statusConfig?.isCompleted || false
                }
              />
            </Col>

            <Col xs={24} lg={12}>
              <CurrentTime
                currentTime={
                  sessionData.expectedEndTime
                    ? new Date(sessionData.expectedEndTime)
                    : currentTime
                }
                sessionData={sessionData}
                remainingSeconds={remainingSeconds}
                displayTime={displayTime}
              />
            </Col>
          </Row>

          {/* Energy Stats */}
          <EnergyStats
            sessionData={sessionData}
            realtimeProgress={realtimeProgress}
          />

          {/* Row 2: Technical Details & Pricing */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>

            <Col xs={24} lg={12}>
              {/* ✅ Truyền handler thanh toán và trạng thái isPaid vào PricingInfo */}
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

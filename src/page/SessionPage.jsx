import React, { useEffect, useState, useRef } from "react";
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
import { ThunderboltOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";

const EnergyPage = ({ userID }) => {
  const navigate = useNavigate();

  // ==================== HOOKS ====================
  const { user, loading: authLoading } = useAuth();
  const { fetchUnpaidPaymentsByUserId } = usePaymentData();
  const { sessionData, currentTime, statusConfig, isLoading, isFinishing, error, errorCode, finishSession, refetch } =
    useEnergySession(userID);

  // ==================== STATE MANAGEMENT ====================
  const [realtimeProgress, setRealtimeProgress] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [_batteryCountdownInfo, setBatteryCountdownInfo] = useState(null);
  // Refs for SSE repeat-detection auto-finish
  const lastSseStringRef = useRef(null);
  const repeatCountRef = useRef(0);
  const sseAutoFinishTriggeredRef = useRef(false);
  const eventSourceRef = useRef(null);
  const preventReconnectRef = useRef(false);

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
        console.log("connectSSE: attempting to connect SSE for sessionId=", sessionId);
        // initialize global flag used to prevent repeated auto-refetch across QR scans
        try {
          if (typeof window !== "undefined" && typeof window.__sessionAutoRefetchHandled === "undefined") {
            window.__sessionAutoRefetchHandled = false;
            // helper to reset the flag (call this when scanning QR)
            window.resetSessionAutoRefetchFlag = () => {
              window.__sessionAutoRefetchHandled = false;
            };
          }
        } catch {
          // ignore
        }

        // reset repeat detection when (re)connecting
        try {
          lastSseStringRef.current = null;
          repeatCountRef.current = 0;
          sseAutoFinishTriggeredRef.current = false;
          preventReconnectRef.current = false;
        } catch {
          /* ignore */
        }
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const sseUrl = `${apiUrl}/api/charging/session/progress/${sessionId}`;
        console.log("connectSSE: opening EventSource ->", sseUrl);
        eventSource = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = eventSource;

        console.log("connectSSE: EventSource created", { readyState: eventSource.readyState });

        eventSource.onopen = () => {
          console.log("SSE open for sessionId=", sessionId, "readyState=", eventSource.readyState);
        };

        // Generic message listener to catch any server-sent events
        eventSource.addEventListener("message", (ev) => {
          try {
            console.log("SSE generic message:", ev.data);
          } catch (err) {
            console.warn("Error logging generic SSE message", err);
          }
        });

        // Lắng nghe sự kiện "chargingProgress"
        eventSource.addEventListener("chargingProgress", (event) => {
          try {
            // Raw SSE payload string
            const raw = String(event.data || "");

            // If the session is already marked completed, stop processing and close SSE
            try {
              if (sessionData && sessionData.isCompleted) {
                console.log("Session already completed; closing SSE and skipping processing");
                preventReconnectRef.current = true;
                if (eventSourceRef.current) {
                  try {
                    eventSourceRef.current.close();
                  } catch {
                    /* ignore */
                  }
                  eventSourceRef.current = null;
                }
                return;
              }
            } catch {
              // ignore and continue processing
            }
            // detect repeated identical payloads
            if (lastSseStringRef.current === raw) {
              repeatCountRef.current = (repeatCountRef.current || 0) + 1;
            } else {
              lastSseStringRef.current = raw;
              repeatCountRef.current = 1;
              sseAutoFinishTriggeredRef.current = false; // reset trigger on new payload
            }

            // If repeated many times, assume backend stopped and SSE is pinging old data
            const REPEAT_THRESHOLD = 4;
            if (!sseAutoFinishTriggeredRef.current && repeatCountRef.current >= REPEAT_THRESHOLD) {
              sseAutoFinishTriggeredRef.current = true;
              console.log(`Detected ${repeatCountRef.current} repeated SSE pings -> attempting auto-finish`);

              // Prevent further reconnects and close the EventSource immediately to stop more pings
              try {
                preventReconnectRef.current = true;
                if (eventSourceRef.current) {
                  try {
                    eventSourceRef.current.close();
                  } catch {
                    /* ignore */
                  }
                  eventSourceRef.current = null;
                }
              } catch {
                /* ignore */
              }

              // If a global flag says we've already handled auto-refetch for this flow, skip refetch/finish
              const globalHandled = typeof window !== "undefined" && !!window.__sessionAutoRefetchHandled;
              if (globalHandled) {
                console.log("Global auto-refetch flag is true — skipping auto-finish/refetch");
                return;
              }

              // Attempt to parse progress and auto-finish using chargedEnergy_kWh
              (async () => {
                try {
                  const progress = JSON.parse(raw);
                  const energyStr = progress.chargedEnergy_kWh || progress.chargedEnergy || "0";
                  const energy = parseFloat(String(energyStr).replace(",", ".")) || 0;

                  // Don't attempt auto-finish if the session is already completed
                  if (sessionData && !sessionData.isCompleted && typeof finishSession === "function") {
                    console.log("Auto-finish: calling finishSession with energy", energy);
                    const res = await finishSession(sessionData.chargingSessionId || sessionData.sessionId, energy);
                    console.log("Auto-finish result:", res);
                    try {
                      await refetch();
                      // mark global flag so we don't auto-refetch again until reset (e.g., next QR)
                      try {
                        if (typeof window !== "undefined") window.__sessionAutoRefetchHandled = true;
                      } catch {
                        /* ignore */
                      }
                    } catch (e) {
                      console.warn("Error refetching after auto-finish:", e);
                    }
                    return;
                  }

                  // If cannot call finishSession, at least refetch to pick server state
                  try {
                    await refetch();
                    try {
                      if (typeof window !== "undefined") window.__sessionAutoRefetchHandled = true;
                    } catch {
                      /* ignore */
                    }
                  } catch (e) {
                    console.warn("Error refetching after repeated SSE detection:", e);
                  }
                } catch (err) {
                  console.warn("Error parsing repeated SSE payload for auto-finish", err);
                }
              })();
            }

            const progress = JSON.parse(raw);
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
                ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
                    2,
                    "0"
                  )}`
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

          // If auto-finish triggered, don't attempt to reconnect
          if (preventReconnectRef.current) {
            try {
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
              }
            } catch {
              // ignore
            }
            return;
          }

          if (eventSource) {
            eventSource.close();
            eventSource = null;
            eventSourceRef.current = null;
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
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      } catch {
        /* ignore */
      }
      preventReconnectRef.current = true;
    };
    // We intentionally do NOT include `finishSession` and `refetch` here to avoid
    // re-creating the EventSource on every render (those functions change identity
    // across renders). The effect should re-run when `sessionData` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.chargingSessionId, sessionData?.sessionId, sessionData]);

  // ==================== RESET GLOBAL AUTO-REFETCH FLAG WHEN ENTERING A NEW SESSION ====
  useEffect(() => {
    try {
      // If we have a new active session that is not completed, reset the global flag
      if (typeof window !== "undefined" && sessionData?.chargingSessionId && !sessionData?.isCompleted) {
        window.__sessionAutoRefetchHandled = false;
      }
    } catch {
      // ignore
    }
  }, [sessionData?.chargingSessionId, sessionData?.isCompleted]);

  // ==================== KIỂM TRA SESSION KẾT THÚC ====================
  useEffect(() => {
    if (!isLoading && !sessionData && !error) {
      console.log("Session đã kết thúc");
    }
  }, [sessionData, isLoading, error]);

  // ==================== LẮNG NGHE SỰ KIỆN SESSION CREATED ====================
  useEffect(() => {
    const handleSessionCreated = () => {
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
    (sessionData && user.id !== sessionData.userId && user.role !== "ADMIN" && user.role !== "MANAGER") ||
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
          <LockOutlined style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }} />

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
              {errorCode && <p style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Mã lỗi: {errorCode}</p>}
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
                batteryLevel={realtimeProgress?.batteryLevel || sessionData.batteryLevel || 0}
                isCharging={statusConfig?.isCharging || false}
                isCompleted={statusConfig?.isCompleted || false}
              />
            </Col>

            <Col xs={24} lg={12}>
              <CurrentTime
                currentTime={sessionData.expectedEndTime ? new Date(sessionData.expectedEndTime) : currentTime}
                sessionData={{
                  ...sessionData,
                  secondRemaining: realtimeProgress?.secondRemaining,
                  maxSeconds: realtimeProgress?.maxSeconds,
                }}
              />
            </Col>
          </Row>

          {/* Thống kê năng lượng */}
          <EnergyStats sessionData={sessionData} realtimeProgress={realtimeProgress} />

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

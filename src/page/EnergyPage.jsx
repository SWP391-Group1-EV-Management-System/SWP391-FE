import React, { useEffect } from "react";
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

  useEffect(() => {
    if (!isLoading && !sessionData && !error) {
      console.log("Session đã kết thúc");
    }
  }, [sessionData, isLoading, error]);

  // ✅ Handler thanh toán - Lấy payment và navigate
  const handlePayment = async () => {
    console.log('💰 [EnergyPage] Payment button clicked');
    console.log('💰 [EnergyPage] Session data:', sessionData);
    console.log('💰 [EnergyPage] User ID:', user?.id);

    if (!user?.id) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Không tìm thấy thông tin người dùng.',
      });
      return;
    }

    try {
      // ✅ Gọi API lấy danh sách payment chưa thanh toán
      const unpaidPayments = await fetchUnpaidPaymentsByUserId(user.id);
      
      console.log('✅ [EnergyPage] Unpaid payments:', unpaidPayments);

      if (unpaidPayments && unpaidPayments.length > 0) {
        // ✅ Tìm payment tương ứng với session hiện tại
        let targetPayment = unpaidPayments.find(
          p => p.sessionId === sessionData?.chargingSessionId || 
               p.chargingSessionId === sessionData?.chargingSessionId ||
               p.session?.chargingSessionId === sessionData?.chargingSessionId
        );

        // Nếu không tìm thấy, lấy payment đầu tiên
        if (!targetPayment) {
          targetPayment = unpaidPayments[0];
          console.log('⚠️ [EnergyPage] Session payment not found, using first unpaid payment');
        }

        // Lấy paymentId (có thể là paymentId hoặc id)
        const paymentId = targetPayment.paymentId || targetPayment.id;
        
        console.log('✅ [EnergyPage] Navigating to payment:', paymentId);
        navigate(`/app/payment/${paymentId}`);
      } else {
        console.warn('⚠️ [EnergyPage] No unpaid payments found');
        notification.info({
          message: 'Không có thanh toán',
          description: 'Bạn không có thanh toán nào cần hoàn thành.',
        });
      }
    } catch (error) {
      console.error('❌ [EnergyPage] Error fetching payments:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
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

          {/* Quick Summary */}
          <Row>
            <Col>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  Tổng năng lượng
                </div>
                <div
                  style={{ color: "#0f766e", fontSize: 18, fontWeight: 700 }}
                >
                  {sessionData.energyCharged
                    ? isNaN(Number(sessionData.energyCharged))
                      ? sessionData.energyCharged
                      : `${Number(sessionData.energyCharged).toLocaleString(
                          "vi-VN"
                        )} kWh`
                    : "-"}
                </div>
              </div>
            </Col>
          </Row>

          {/* Row 1: Battery & Current Time */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BatteryProgress
                batteryLevel={sessionData.batteryLevel || 0}
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
                sessionData={sessionData}
                finishSession={finishSession}
                isFinishing={isFinishing}
              />
            </Col>
          </Row>

          {/* Energy Stats */}
          <EnergyStats sessionData={sessionData} />

          {/* Row 2: Technical Details & Pricing */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>

            <Col xs={24} lg={12}>
              {/* ✅ Truyền handler thanh toán vào PricingInfo */}
              <PricingInfo 
                sessionData={sessionData} 
                onPay={handlePayment}
              />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;

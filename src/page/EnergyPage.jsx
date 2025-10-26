import React from "react";
import { Row, Col, Space, Spin, Alert, Button, Descriptions } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import WaitingQueue from "../components/energy/WaitingQueue";
import { useEnergySession } from "../hooks/useEnergySession";
import {
  ThunderboltOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import ArrivalTime from "../components/energy/ArrivalTime";
import { useAuth } from "../hooks/useAuth";

const EnergyPage = (userID) => {
  const navigate = useNavigate();
  const {
    sessionData,
    currentTime,
    statusConfig,
    isLoading,
    error,
    errorCode,
    createSession,
    updateSessionStatus,
    refetch,
  } = useEnergySession(userID);
  const { user, loading: authLoading } = useAuth();

  // Xử lý loading
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

  // Xử lý 403: user chưa đăng nhập hoặc không phải chủ phiên sạc
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

  // Xử lý các lỗi khác
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
          {/* Header Section - Full Width */}
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

          {/* Row 1: 2 Columns Equal Size */}
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
              />
            </Col>
            {/* Nếu là booking thì dùng cái này */}
            {/* <Col xs={24} lg={12}>
              <ArrivalTime
                bookingData={sessionData.bookingData}
                onSessionCreate={(sessionInfo) => {
                  console.log("New session created:", sessionInfo);
                  // Có thể gọi refetch để cập nhật dữ liệu
                }}
                onSessionEnd={(sessionInfo) => {
                  console.log("Session ended:", sessionInfo);
                  // Cập nhật trạng thái session
                  updateSessionStatus("stop");
                }}
                onTimeExpired={() => {
                  console.log("Session time expired");
                  // Xử lý khi hết thời gian
                }}
                onCancel={() => {
                  console.log("Booking cancelled");
                  // Xử lý hủy booking
                }}
              />
            </Col> */}

            {/* Nếu là WaitingList thì dùng cái này */}
            {/* <Col xs={24} lg={12}>
              <WaitingQueue
                queuePosition={1}
                estimatedWaitTime={45}
                totalInQueue={8}
                averageSessionTime={30}
                currentSessionRemaining={15}
                onCancel={() => {
                  console.log("Queue cancelled");
                  // Xử lý hủy hàng chờ
                }}
              />
            </Col> */}
          </Row>

          <EnergyStats sessionData={sessionData} />

          {/* Row 2: 2 Columns Equal Size */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>
            <Col xs={24} lg={12}>
              <PricingInfo sessionData={sessionData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;

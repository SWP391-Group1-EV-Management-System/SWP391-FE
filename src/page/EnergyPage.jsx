import React from "react";
import { Row, Col, Space, Spin, Alert } from "antd";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import WaitingQueue from "../components/energy/WaitingQueue";
import { useEnergySession } from "../hooks/useEnergySession";
import { ThunderboltOutlined } from '@ant-design/icons';
import ArrivalTime from "../components/energy/ArrivalTime";

const EnergyPage = ({ userId = "" }) => { // Default userId for testing
  const { 
    sessionData, 
    currentTime, 
    statusConfig, 
    isLoading, 
    error, 
    createSession, 
    updateSessionStatus 
  } = useEnergySession(userId);

  // Handle loading và error states
  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px',
        background: 'white',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" tip="Đang tải thông tin phiên sạc..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        background: 'white',
        minHeight: '100vh'
      }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
        />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div style={{ 
        padding: '20px',
        background: 'white',
        minHeight: '100vh'
      }}>
        <Alert
          message="Không có phiên sạc"
          description="Hiện tại không có phiên sạc nào đang hoạt động"
          type="info"
          showIcon
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
              <CurrentTime currentTime={currentTime} />
            </Col>
            {/* Nếu là booking thì dùng cái này */}
            <Col xs={24} lg={12}>
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
            </Col>

            {/* Nếu là WaitingList thì dùng cái này */}
            <Col xs={24} lg={12}>
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
            </Col>
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
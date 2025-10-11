import React from "react";
import { Row, Col, Space } from "antd";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import { ThunderboltOutlined } from "@ant-design/icons";

const EnergyPage = () => {
  // Dữ liệu hardcode
  const sessionData = {
    stationName: "Trạm sạc Vincom Center",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    socketType: "CCS2",
    power: "50kW",
    batteryLevel: 65,
    timeElapsed: "00:45:30",
    estimatedTimeLeft: "01:20:15",
    energyCharged: "32.5",
    estimatedCost: "125,000",
    status: "charging",
    pricePerKwh: "3,500",
    pricePerMin: "500",
    chargingPower: "45.2",
    voltage: "380V",
    current: "118A",
  };

  const currentTime = new Date();

  const statusConfig = {
    color: sessionData.status === "charging" ? "green" : "red",
    icon: sessionData.status === "charging" ? "⚡" : "✔",
    text: sessionData.status === "charging" ? "Đang sạc" : "Hoàn thành",
  };

  const handleStopCharging = () => {
    console.log("Sạc đã bị dừng!");
  };

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
            title={sessionData.stationName}
            icon={<ThunderboltOutlined />}
            subtitle={sessionData.address}
            statusTag={{
              color: statusConfig.color,
              icon: statusConfig.icon,
              text: statusConfig.text,
            }}
          />

          {/* Row 1: BatteryProgress and CurrentTime */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <BatteryProgress
                batteryLevel={sessionData.batteryLevel}
                isCharging={statusConfig.text === "Đang sạc"}
                isCompleted={statusConfig.text === "Hoàn thành"}
              />
            </Col>
            <Col xs={24} md={12}>
              <CurrentTime currentTime={currentTime} onStopCharging={handleStopCharging} />
            </Col>
          </Row>

          {/* Row 2: EnergyStats - Full Width */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <EnergyStats sessionData={sessionData} />
            </Col>
          </Row>

          {/* Row 3: TechnicalDetails and PricingInfo */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>
            <Col xs={24} md={12}>
              <PricingInfo sessionData={sessionData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;
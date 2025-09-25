// ShowCharging.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "../../assets/styles/ShowCharging.css";
import { PiChargingStationBold } from "react-icons/pi";

const ShowCharging = () => {
  const [sessionData, setSessionData] = useState({
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
    current: "118A"
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "charging":
        return { bg: "success", icon: "⚡", text: "Đang sạc", color: "#10b981" };
      case "stopping":
        return { bg: "warning", icon: "⏸️", text: "Dừng sạc", color: "#f59e0b" };
      case "completed":
        return { bg: "success", icon: "✅", text: "Hoàn tất", color: "#10b981" };
      case "error":
        return { bg: "danger", icon: "⚠️", text: "Lỗi", color: "#ef4444" };
      default:
        return { bg: "secondary", icon: "🔌", text: "Kết nối", color: "#6b7280" };
    }
  };

  const statusConfig = getStatusConfig(sessionData.status);

  // Calculate circle progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sessionData.batteryLevel / 100) * circumference;

  return (
    <div className="charging-session-container">
      <Container fluid className="px-4">
        {/* Header Section */}
        <div className="charging-session-header">
          <Row className="align-items-center">
            {/* Logo */}
            <Col xs="auto">
              <div className="header-icon">
                <PiChargingStationBold />
              </div>
            </Col>
            
            {/* Tên trạm và địa chỉ */}
            <Col>
              <div className="header-info">
                <h1 className="header-title">{sessionData.stationName}</h1>
                <p className="header-address">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {sessionData.address}
                </p>
              </div>
            </Col>
            
            {/* Trạng thái */}
            <Col xs="auto">
              <Badge 
                className="status-badge" 
                style={{ backgroundColor: statusConfig.color, border: 'none' }}
              >
                {statusConfig.icon} {statusConfig.text}
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <Row className="g-4 mb-4">
          {/* Battery Progress Section */}
          <Col lg={6}>
            <div className="progress-container">
              <h3 className="progress-title">Trạng thái pin</h3>
              <div className="progress-circle-container">
                <svg width="200" height="200" className="progress-circle-svg">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke={statusConfig.color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="progress-circle"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="progress-text">
                  <div className="battery-percentage">{sessionData.batteryLevel}%</div>
                  <div className="battery-label">Mức pin hiện tại</div>
                </div>
              </div>
            </div>
          </Col>

          {/* Clock and Current Time */}
          <Col lg={6}>
            <div className="clock-container">
              <div className="clock-label">Thời gian hiện tại</div>
              <div className="clock-time">{currentTime.toLocaleTimeString()}</div>
              <div className="clock-date">{currentTime.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <div className="info-card-container">
          <div className="info-card">
            <div className="card-icon">⚡</div>
            <h4 className="card-title">Năng lượng đã sạc</h4>
            <div className="card-value">{sessionData.energyCharged}</div>
            <div className="card-sub">kWh</div>
          </div>

          <div className="info-card">
            <div className="card-icon">⏱️</div>
            <h4 className="card-title">Thời gian đã sạc</h4>
            <div className="card-value">{sessionData.timeElapsed}</div>
            <div className="card-sub">Thời gian còn lại: {sessionData.estimatedTimeLeft}</div>
          </div>

          <div className="info-card">
            <div className="card-icon">💰</div>
            <h4 className="card-title">Chi phí ước tính</h4>
            <div className="card-value">{sessionData.estimatedCost}</div>
            <div className="card-sub">VNĐ</div>
          </div>
        </div>

        {/* Technical Details */}
        <Row className="g-4">
          <Col lg={6}>
            <Card className="tech-info-card">
              <Card.Header>
                <h5>
                  <i className="fas fa-cog me-2"></i>
                  Thông số kỹ thuật
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="tech-grid">
                  <div className="tech-item">
                    <span className="tech-label">Loại cổng sạc</span>
                    <span className="tech-value">{sessionData.socketType}</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-label">Công suất tối đa</span>
                    <span className="tech-value">{sessionData.power}</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-label">Công suất hiện tại</span>
                    <span className="tech-value highlight">{sessionData.chargingPower} kW</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-label">Điện áp</span>
                    <span className="tech-value">{sessionData.voltage}</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-label">Dòng điện</span>
                    <span className="tech-value">{sessionData.current}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="pricing-info-card">
              <Card.Header>
                <h5>
                  <i className="fas fa-dollar-sign me-2"></i>
                  Thông tin giá cả
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="pricing-grid">
                  <div className="pricing-item">
                    <span className="pricing-label">Giá theo kWh</span>
                    <span className="pricing-value">{sessionData.pricePerKwh}đ</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Giá theo phút</span>
                    <span className="pricing-value">{sessionData.pricePerMin}đ</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Tổng thời gian</span>
                    <span className="pricing-value">{sessionData.timeElapsed}</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Tổng năng lượng</span>
                    <span className="pricing-value">{sessionData.energyCharged} kWh</span>
                  </div>
                </div>
                
                <div className="cost-summary">
                  <div className="cost-label">Tổng chi phí dự kiến</div>
                  <div className="cost-amount">{sessionData.estimatedCost}đ</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ShowCharging;
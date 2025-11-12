/**
 * HOMEPAGE COMPONENT
 * 
 * Trang chính hiển thị dashboard hệ thống quản lý trạm sạc xe điện
 * 
 * Tính năng:
 * - Hiển thị thống kê hệ thống với animation
 * - Danh sách hoạt động gần đây
 * - Trạm sạc nổi bật
 * - Thành tích người dùng
 * - Thông tin hỗ trợ và ưu đãi
 */

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import {
  BsLightning,
  BsMap,
  BsClock,
  BsBookmarkStar,
  BsShield,
  BsGlobe,
  BsStarFill,
  BsTrophy,
  BsGraphUp,
  BsPeople,
  BsCheck2Circle,
  BsArrowRight,
  BsFire,
  BsAward,
} from "react-icons/bs";
import "../assets/styles/HomePage.css";
import useAuth from "../hooks/useAuth";

function HomePage() {
  // ===== STATE: Giá trị animation cho các thống kê =====
  const [animatedValues, setAnimatedValues] = useState({
    stations: 0,
    sessions: 0,
    users: 0,
    reliability: 0,
  });

  // ===== HOOK: Lấy thông tin người dùng =====
  const { user, loading, fetchUserProfile } = useAuth();

  // ===== EFFECT: Tải profile người dùng khi component mount =====
  useEffect(() => {
    fetchUserProfile().catch(() => {});
  }, [fetchUserProfile]);

  // ===== Xác định tên hiển thị người dùng =====
  const userName = loading
    ? "Đang tải..."
    : user
    ? `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() || (user.email ? user.email.split("@")[0] : "Guest User")
    : "Guest User";
  
  // ===== EFFECT: Animation đếm số liệu thống kê =====
  useEffect(() => {
    const duration = 2000; // Thời gian animation: 2 giây
    const steps = 60; // Số bước animation
    const increment = duration / steps;

    // Giá trị mục tiêu
    const targets = {
      stations: 248,
      sessions: 1247,
      users: 8932,
      reliability: 99.8,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Cập nhật giá trị animation theo tỷ lệ tiến độ
      setAnimatedValues({
        stations: Math.floor(targets.stations * progress),
        sessions: Math.floor(targets.sessions * progress),
        users: Math.floor(targets.users * progress),
        reliability: (targets.reliability * progress).toFixed(1),
      });

      // Kết thúc animation
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  // ===== DATA: Thống kê hệ thống =====
  const stats = [
    {
      label: "Trạm sạc hoạt động",
      value: animatedValues.stations,
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Phiên sạc tháng này",
      value: animatedValues.sessions.toLocaleString(),
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Người dùng active",
      value: animatedValues.users.toLocaleString(),
      icon: BsGlobe,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      change: "+15%",
      trend: "up",
    },
    {
      label: "Độ tin cậy",
      value: `${animatedValues.reliability}%`,
      icon: BsShield,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      change: "+0.2%",
      trend: "up",
    },
  ];

  // ===== DATA: Hoạt động gần đây =====
  const recentActivities = [
    {
      icon: BsCheck2Circle,
      text: "Trạm #A-234 hoàn thành sạc",
      time: "2 phút trước",
      color: "#43e97b",
    },
    {
      icon: BsLightning,
      text: "Trạm sạc nhanh mới tại Trung tâm Thành phố",
      time: "15 phút trước",
      color: "#667eea",
    },
    {
      icon: BsPeople,
      text: "1,000+ người dùng tham gia tháng này",
      time: "1 giờ trước",
      color: "#4facfe",
    },
    {
      icon: BsTrophy,
      text: "Bạn đã nhận huy hiệu 'Eco Warrior'!",
      time: "2 giờ trước",
      color: "#f5576c",
    },
    {
      icon: BsGraphUp,
      text: "Tiết kiệm năng lượng tăng 23%",
      time: "5 giờ trước",
      color: "#38f9d7",
    },
  ];

  // ===== DATA: Trạm sạc nổi bật =====
  const featuredStations = [
    {
      name: "Downtown Central Hub",
      rating: 4.9,
      charging: 12,
      available: 8,
      distance: "0.5 km",
    },
    {
      name: "Airport Express Station",
      rating: 4.8,
      charging: 8,
      available: 4,
      distance: "2.3 km",
    },
    {
      name: "Shopping Mall Complex",
      rating: 4.7,
      charging: 15,
      available: 10,
      distance: "1.2 km",
    },
  ];

  // ===== DATA: Thành tích người dùng =====
  const achievements = [
    {
      icon: BsTrophy,
      title: "Eco Champion",
      description: "Tiết kiệm 100 kWh",
      progress: 78,
      gradient: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: BsAward,
      title: "Power User",
      description: "50 phiên sạc",
      progress: 92,
      gradient: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: BsFire,
      title: "Streak Master",
      description: "30 ngày liên tục",
      progress: 45,
      gradient: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  // ===== RENDER UI =====
  return (
    <div className="home-dashboard-container">
      <Container fluid className="px-4">
        {/* Header chào mừng người dùng */}
        <div className="hero-header mb-4">
          <Row className="align-items-center">
            <Col lg={9}>
              <div className="d-flex align-items-center mb-2">
                <div>
                  <h1 className="hero-title mb-1">Chào mừng {userName} đến với Eco-Z</h1>
                  <p className="hero-subtitle mb-0">
                    Hệ thống quản lý trạm sạc xe điện thông minh, bền vững và
                    thân thiện môi trường
                  </p>
                </div>
              </div>
            </Col>
            <Col lg={3} className="text-lg-end mt-3 mt-lg-0">
              <Badge className="status-badge-premium">
                <BsShield className="me-2" />
                Hệ thống hoạt động tốt
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Các card thống kê */}
        <div className="info-card-container">
          {stats.map((stat, index) => (
            <div key={index} className="info-card">
              <div className="card-icon">
                <stat.icon size={32} />
              </div>
              <h4 className="card-title">{stat.label}</h4>
              <div className="card-value">{stat.value}</div>
              <div className="card-sub">
                <BsGraphUp className="me-1" size={12} />
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Hoạt động gần đây và Trạm sạc nổi bật */}
        <Row className="g-4 mb-4">
          {/* Cột hoạt động gần đây */}
          <Col lg={6}>
            <Card className="info-detail-card border-0 shadow-sm">
              <Card.Header className="info-detail-header">
                <h5 className="mb-0">
                  <BsClock className="me-2" />
                  Hoạt động gần đây
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {recentActivities.map((activity, index) => (
                    <ListGroup.Item key={index} className="activity-item">
                      <div className="d-flex align-items-center">
                        <div
                          className="activity-icon-wrapper me-3"
                          style={{
                            background: `${activity.color}20`,
                            color: activity.color,
                          }}
                        >
                          <activity.icon size={18} />
                        </div>
                        <div className="flex-grow-1">
                          <p className="activity-text mb-0">{activity.text}</p>
                          <small className="activity-time">
                            {activity.time}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Cột trạm sạc nổi bật */}
          <Col lg={6}>
            <Card className="info-detail-card border-0 shadow-sm">
              <Card.Header className="info-detail-header">
                <h5 className="mb-0">
                  <BsStarFill className="me-2 text-warning" />
                  Trạm sạc nổi bật
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {featuredStations.map((station, index) => (
                  <div key={index} className="featured-station-item mb-3">
                    {/* Header: Tên trạm và đánh giá */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="station-name mb-1">{station.name}</h6>
                      <Badge className="rating-badge">
                        <BsStarFill size={10} className="me-1" />
                        {station.rating}
                      </Badge>
                    </div>
                    {/* Thông tin trạm: số trạm đang sạc, trống, khoảng cách */}
                    <div className="station-info">
                      <span className="info-item">
                        <BsLightning size={14} className="me-1 text-warning" />
                        {station.charging} đang sạc
                      </span>
                      <span className="info-item ms-3">
                        <BsCheck2Circle
                          size={14}
                          className="me-1 text-success"
                        />
                        {station.available} trống
                      </span>
                      <span className="info-item ms-3">
                        <BsMap size={14} className="me-1 text-primary" />
                        {station.distance}
                      </span>
                    </div>
                    {index < featuredStations.length - 1 && (
                      <hr className="my-3" />
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Phần thành tích người dùng */}
        <h3 className="section-title mb-3">
          <BsTrophy className="me-2 text-warning" />
          Thành tích của bạn
        </h3>
        <Row className="g-4 mb-4">
          {achievements.map((achievement, index) => (
            <Col key={index} lg={4} md={6}>
              <Card className="info-detail-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  {/* Header thành tích: icon và tiêu đề */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="achievement-icon me-3">
                      <achievement.icon size={24} />
                    </div>
                    <div>
                      <h6 className="achievement-title mb-0">
                        {achievement.title}
                      </h6>
                      <small className="achievement-desc">
                        {achievement.description}
                      </small>
                    </div>
                  </div>
                  {/* Progress bar hiển thị tiến độ */}
                  <ProgressBar
                    now={achievement.progress}
                    variant="primary"
                    style={{ height: "8px" }}
                  />
                  <div>
                    <small className="progress-text">
                      {achievement.progress}%
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Phần thông tin hỗ trợ và ưu đãi */}
        <Row className="g-4 mb-4">
          {/* Card hỗ trợ 24/7 */}
          <Col lg={6}>
            <Card className="info-detail-card border-0 shadow">
              <Card.Body className="p-4 text-center">
                <div className="text-primary mb-3">
                  <BsShield size={48} />
                </div>
                <h5 className="fw-semibold mb-3">Hỗ trợ 24/7</h5>
                <p className="text-muted mb-4">
                  Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng giúp đỡ bạn mọi
                  lúc, mọi nơi.
                </p>
                <Button
                  variant="primary"
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  Liên hệ ngay
                  <BsArrowRight size={18} />
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Card ưu đãi đặc biệt */}
          <Col lg={6}>
            <Card className="info-detail-card border-0 shadow">
              <Card.Body className="p-4 text-center">
                <div className="text-warning mb-3">
                  <BsBookmarkStar size={40} />
                </div>
                <h6 className="fw-semibold mb-3">Ưu đãi đặc biệt</h6>
                <p className="text-muted mb-3">
                  Giảm 20% cho 10 lần sạc đầu tiên
                </p>
                <Button variant="warning" size="sm">
                  Nhận ngay
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;

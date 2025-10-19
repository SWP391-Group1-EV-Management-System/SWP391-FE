/**
 * HomePage Component
 * Main dashboard page for the Eco-Z EV Charging Management System
 * Displays system statistics, quick actions, recent activities, and user achievements
 */

import React, { useState, useEffect } from "react";

// React Bootstrap Components
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

// Bootstrap Icons
import {
  BsLightning, // Lightning icon for charging/energy
  BsMap, // Map icon for location services
  BsClock, // Clock icon for time/history
  BsBookmarkStar, // Bookmark star for favorites/promotions
  BsShield, // Shield icon for security/reliability
  BsGlobe, // Globe icon for global/network
  BsStarFill, // Filled star for ratings
  BsTrophy, // Trophy for achievements
  BsGraphUp, // Graph up for trends/statistics
  BsPeople, // People icon for users
  BsCheck2Circle, // Check circle for completion
  BsArrowRight, // Arrow right for navigation
  BsFire, // Fire icon for streaks/hot items
  BsAward, // Award icon for achievements
} from "react-icons/bs";

// Component Styles
import "../assets/styles/HomePage.css";
import useAuth from "../hooks/useAuth";

/**
 * HomePage Functional Component
 * @returns {JSX.Element} The rendered homepage dashboard
 */
function HomePage() {
  // ==================== STATE MANAGEMENT ====================

  /**
   * State for animated counter values
   * Displays animated numbers for statistics cards
   */
  const [animatedValues, setAnimatedValues] = useState({
    stations: 0, // Number of active charging stations
    sessions: 0, // Number of charging sessions today
    users: 0, // Number of active users
    reliability: 0, // System reliability percentage
  });

  // Use authenticated profile from hook instead of localStorage
  const { user, loading, fetchUserProfile } = useAuth();

  useEffect(() => {
    // ensure profile is loaded when HomePage mounts
    fetchUserProfile().catch(() => {});
  }, [fetchUserProfile]);

  const userName = loading
    ? "Đang tải..."
    : user
    ? `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() || (user.email ? user.email.split("@")[0] : "Guest User")
    : "Guest User";
  
  // ==================== EFFECTS ====================

  /**
   * Effect: Animate statistics numbers on component mount
   * Creates a smooth counting animation from 0 to target values
   */
  useEffect(() => {
    // Animation configuration
    const duration = 2000; // Total animation duration in milliseconds
    const steps = 60; // Number of animation steps
    const increment = duration / steps; // Time per step

    // Target values for the animation
    const targets = {
      stations: 248, // Target: 248 active stations
      sessions: 1247, // Target: 1,247 sessions today
      users: 8932, // Target: 8,932 active users
      reliability: 99.8, // Target: 99.8% reliability
    };

    let currentStep = 0;

    // Set up interval for animation
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps; // Calculate progress (0 to 1)

      // Update animated values proportionally
      setAnimatedValues({
        stations: Math.floor(targets.stations * progress),
        sessions: Math.floor(targets.sessions * progress),
        users: Math.floor(targets.users * progress),
        reliability: (targets.reliability * progress).toFixed(1),
      });

      // Complete animation when all steps are done
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets); // Ensure final values are exact
      }
    }, increment);

    // Cleanup: Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // ==================== DATA CONFIGURATION ====================

  /**
   * Statistics cards data
   * Displays key metrics about the charging system
   */
  const stats = [
    {
      label: "Trạm sạc hoạt động", // Active charging stations
      value: animatedValues.stations,
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple gradient
      change: "+12%",
      trend: "up",
    },
    {
      label: "Phiên sạc tháng này", // Today's charging sessions
      value: animatedValues.sessions.toLocaleString(),
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink gradient
      change: "+8%",
      trend: "up",
    },
    {
      label: "Người dùng active", // Active users
      value: animatedValues.users.toLocaleString(),
      icon: BsGlobe,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Blue gradient
      change: "+15%",
      trend: "up",
    },
    {
      label: "Độ tin cậy", // System reliability
      value: `${animatedValues.reliability}%`,
      icon: BsShield,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green gradient
      change: "+0.2%",
      trend: "up",
    },
  ];

  /**
   * Recent activities data
   * Shows latest system events and user activities
   */
  const recentActivities = [
    {
      icon: BsCheck2Circle,
      text: "Trạm #A-234 hoàn thành sạc", // Station completed charging
      time: "2 phút trước",
      color: "#43e97b", // Green
    },
    {
      icon: BsLightning,
      text: "Trạm sạc nhanh mới tại Trung tâm Thành phố", // New fast charging station
      time: "15 phút trước",
      color: "#667eea", // Purple
    },
    {
      icon: BsPeople,
      text: "1,000+ người dùng tham gia tháng này", // New users this month
      time: "1 giờ trước",
      color: "#4facfe", // Blue
    },
    {
      icon: BsTrophy,
      text: "Bạn đã nhận huy hiệu 'Eco Warrior'!", // Achievement unlocked
      time: "2 giờ trước",
      color: "#f5576c", // Pink
    },
    {
      icon: BsGraphUp,
      text: "Tiết kiệm năng lượng tăng 23%", // Energy savings increased
      time: "5 giờ trước",
      color: "#38f9d7", // Cyan
    },
  ];

  /**
   * Featured charging stations data
   * Displays top-rated nearby stations
   */
  const featuredStations = [
    {
      name: "Downtown Central Hub", // Station name
      rating: 4.9, // User rating (out of 5)
      charging: 12, // Currently charging vehicles
      available: 8, // Available charging ports
      distance: "0.5 km", // Distance from user
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

  /**
   * User achievements data
   * Tracks user progress towards different goals
   */
  const achievements = [
    {
      icon: BsTrophy,
      title: "Eco Champion", // Achievement name
      description: "Tiết kiệm 100 kWh", // Goal: Save 100 kWh
      progress: 78, // Progress: 78%
      gradient: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: BsAward,
      title: "Power User",
      description: "50 phiên sạc", // Goal: 50 charging sessions
      progress: 92, // Progress: 92%
      gradient: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: BsFire,
      title: "Streak Master",
      description: "30 ngày liên tục", // Goal: 30 day streak
      progress: 45, // Progress: 45%
      gradient: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  // ==================== RENDER ====================

  return (
    <div className="home-dashboard-container">
      <Container fluid className="px-4">
        {/* Hero Header Section */}
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

        {/* Stats Cards */}
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

        {/* Activities and Featured Stations */}
        <Row className="g-4 mb-4">
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
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="station-name mb-1">{station.name}</h6>
                      <Badge className="rating-badge">
                        <BsStarFill size={10} className="me-1" />
                        {station.rating}
                      </Badge>
                    </div>
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

        {/* Achievements Section */}
        <h3 className="section-title mb-3">
          <BsTrophy className="me-2 text-warning" />
          Thành tích của bạn
        </h3>
        <Row className="g-4 mb-4">
          {achievements.map((achievement, index) => (
            <Col key={index} lg={4} md={6}>
              <Card className="info-detail-card border-0 shadow-sm">
                <Card.Body className="p-4">
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

        {/* Enhanced Information Cards */}
        <Row className="g-4 mb-4">
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

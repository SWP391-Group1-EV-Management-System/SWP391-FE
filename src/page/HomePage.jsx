// Trang chủ - hiển thị thống kê tổng quan và hoạt động gần đây của user
/**
 * HOMEPAGE COMPONENT - FIXED VERSION
 * ✅ Sửa mapping đúng với API response structure
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  BsLightning,
  BsMap,
  BsClock,
  BsShield,
  BsGlobe,
  BsStarFill,
  BsTrophy,
  BsCheck2Circle,
  BsFire,
  BsAward,
} from "react-icons/bs";
import "../assets/styles/HomePage.css";
import useAuth from "../hooks/useAuth";
import { useDashboard } from "../hooks/useUser";
import { useHistory } from "../hooks/useHistory";
import { useChargingStations } from "../hooks/useChargingStations";

function HomePage() {
  // State cho animation đếm số liệu
  const [animatedValues, setAnimatedValues] = useState({
    totalPaid: 0,
    totalKwh: 0,
    sessions: 0,
  });

  const { user, loading, fetchUserProfile } = useAuth();
  const { dashboardData, loading: dashboardLoading } = useDashboard(user?.id);

  // Tải thông tin user khi component mount
  useEffect(() => {
    fetchUserProfile().catch(() => {});
  }, [fetchUserProfile]);

  // Format số tiền theo VND
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xác định tên hiển thị của user
  const userName = loading
    ? "Đang tải..."
    : user
    ? `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() ||
      (user.email ? user.email.split("@")[0] : "Guest User")
    : "Guest User";

  // Animation đếm số liệu thống kê
  useEffect(() => {
    if (!dashboardData || dashboardLoading) return;

    console.log("🎯 Starting animation with data:", dashboardData);

    const duration = 2000; // 2 giây
    const steps = 60;
    const increment = duration / steps;

    // ✅ MAPPING ĐÚNG TỪ API RESPONSE
    const targets = {
      totalPaid: dashboardData.totalPriceIsPaid || 0,
      totalKwh: dashboardData.totalKwHBeCharged || 0,
      sessions: dashboardData.totalChargingSessionCompleted || 0,
    };

    console.log("🎯 Animation targets:", targets);

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // ✅ CẬP NHẬT ĐÚNG CẤU TRÚC
      setAnimatedValues({
        totalPaid: Math.floor(targets.totalPaid * progress),
        totalKwh: Math.floor(targets.totalKwh * progress),
        sessions: Math.floor(targets.sessions * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        // Set giá trị cuối cùng chính xác
        setAnimatedValues({
          totalPaid: targets.totalPaid,
          totalKwh: targets.totalKwh,
          sessions: targets.sessions,
        });
      }
    }, increment);

    return () => clearInterval(timer);
  }, [dashboardData, dashboardLoading]);

  // Dữ liệu thống kê hiển thị ở đầu trang
  const stats = [
    {
      label: "Tổng chi phí đã thanh toán",
      value: formatCurrency(animatedValues.totalPaid),
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: "up",
    },
    {
      label: "Tổng phiên sạc hoàn thành",
      value: animatedValues.sessions.toLocaleString() + " phiên",
      icon: BsLightning,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      trend: "up",
    },
    {
      label: "Tổng năng lượng đã sạc",
      value: animatedValues.totalKwh.toLocaleString() + " kWh",
      icon: BsGlobe,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      trend: "up",
    },
  ];

  // Lấy lịch sử hoạt động gần đây
  const {
    history,
    loading: historyLoading,
    error: historyError,
    fetchHistory,
  } = useHistory();

  // Tải lịch sử khi có user
  useEffect(() => {
    if (user?.id) {
      fetchHistory(user.id);
    }
  }, [user?.id, fetchHistory]);

  // Map lịch sử thành danh sách hoạt động gần đây
  const recentActivities = useMemo(() => {
    if (!history || history.length === 0) {
      return [
        {
          icon: BsCheck2Circle,
          text: "Chưa có hoạt động gần đây",
          time: "",
          color: "#999",
        },
      ];
    }

    // Sort by startTime desc and take up to 5
    const sorted = [...history].sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
    const items = sorted.slice(0, 5).map((s, idx) => {
      const stationName =
        s.station?.name || s.station?.address || "Trạm không xác định";
      const sessionId = s.sessionId || s.id || "";
      const time = s.startTime
        ? new Date(s.startTime).toLocaleString("vi-VN")
        : "";
      // Pick color based on index for visual variety
      const colors = ["#43e97b", "#667eea", "#4facfe", "#f5576c", "#38f9d7"];
      const color = colors[idx % colors.length];

      return {
        icon: s.status === "COMPLETED" ? BsCheck2Circle : BsLightning,
        text: `${sessionId ? `${sessionId} - ` : ""}${stationName}`,
        time,
        color,
      };
    });

    return items;
  }, [history]);

  // Lấy danh sách trạm sạc nổi bật
  const {
    stations: chargingStations,
    statistics: stationsStats,
    loading: stationsLoading,
    error: stationsError,
    refresh: refreshStations,
  } = useChargingStations({ autoFetch: true, useLocation: true });

  // Lấy 3 trạm gần nhất
  const featuredStations = useMemo(() => {
    if (!Array.isArray(chargingStations) || chargingStations.length === 0) {
      return [];
    }

    // Take first 3 stations (MapPage sorts by distance when useLocation=true,
    // here we assume backend returns a useful ordering; you can change to nearest)
    return chargingStations.slice(0, 3).map((station) => ({
      name: station.name || station.address || "Trạm không tên",
      charging: station.totalSlots || station.numberOfPosts || 0,
      available: station.availableSlots || 0,
      distance: station.distance || "N/A",
      raw: station, // keep raw station in case modal/detail is needed later
    }));
  }, [chargingStations]);

  // Dữ liệu thành tích người dùng
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

  // Hiển thị giao diện dashboard
  return (
    <div className="home-dashboard-container">
      <Container fluid className="px-4">
        {/* Header chào mừng người dùng */}
        <div className="hero-header mb-4">
          <Row className="align-items-center">
            <Col lg={9}>
              <div className="d-flex align-items-center mb-2">
                <div>
                  <h1 className="hero-title mb-1">
                    Chào mừng {userName} đến với Eco-Z
                  </h1>
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

        {/* Loading State */}
        {dashboardLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Các card thống kê */}
        {!dashboardLoading && (
          <Row className="info-card-container">
            {stats.map((stat, index) => (
              <Col lg={4} md={4} sm={12} key={index}>
                <div className="info-card">
                  <div className="card-icon">
                    <stat.icon size={32} color="#0b9459" />
                  </div>
                  <div className="card-value" style={{ color: "black" }}>
                    {stat.value}
                  </div>
                  <h4 className="card-title">{stat.label}</h4>
                </div>
              </Col>
            ))}
          </Row>
        )}

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
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="station-name mb-1">{station.name}</h6>
                    </div>
                    <div className="station-info">
                      <span className="info-item">
                        <BsLightning size={14} className="me-1 text-warning" />
                        {station.charging} chổ sạc
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
      </Container>
    </div>
  );
}

export default HomePage;

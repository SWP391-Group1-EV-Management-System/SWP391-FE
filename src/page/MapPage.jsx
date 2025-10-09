// Trang hiển thị bản đồ và danh sách trạm sạc
import React, { useState } from "react";

// Import thư viện UI
import { Container, Row, Col, Card } from "react-bootstrap";

// Import hook tùy chỉnh để quản lý dữ liệu trạm sạc
import { useChargingStations } from "../hooks/useChargingStations.js";

// Import các component con
import StationModal from "../components/station/StationModal.jsx";
import GGMap from "../components/map/Map.jsx";

// Import PageHeader
import PageHeader from "../components/PageHeader";

// Import icons
import {
  BsLightning,
  BsPeople,
  BsGeoAlt,
  BsClock,
  BsBattery,
  BsSpeedometer2,
} from "react-icons/bs";
import { EnvironmentOutlined } from '@ant-design/icons';

// Import CSS
import "../assets/styles/MapPage.css";

// Component chính cho trang bản đồ
function MapPage() {
  // Sử dụng hook để lấy dữ liệu trạm sạc
  const {
    stations: chargingStations,
    statistics: mapStats,
    loading,
    error,
    refresh: refreshStations,
    fetchStationPosts,
  } = useChargingStations({
    autoFetch: true, // Tự động tải dữ liệu khi component được tạo
  });

  // State quản lý modal hiển thị chi tiết trạm sạc
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Các hàm tiện ích

  // Chuyển đổi trạng thái thành text tiếng Việt
  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Còn trống";
      case "busy":
        return "Đang sử dụng";
      case "maintenance":
        return "Bảo trì";
      default:
        return "Không xác định";
    }
  };

  // Lấy class CSS cho trạng thái
  const getStatusClass = (status) => {
    return `station-status ${status}`;
  };

  // Xử lý khi click vào trạm sạc
  const handleStationClick = async (station) => {
    try {
      // Lấy thông tin chi tiết trụ sạc của trạm
      const stationPosts = await fetchStationPosts(station.id);

      // Gắn thông tin trụ sạc vào station object
      const stationWithPosts = {
        ...station,
        posts: stationPosts,
      };

      setSelectedStation(stationWithPosts);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading station details:", error);
      // Vẫn hiển thị modal với thông tin cơ bản
      setSelectedStation(station);
      setShowModal(true);
    }
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };

  // Giao diện component
  return (
    <div className="map-page-container">
      <PageHeader
        title="Bản đồ trạm sạc"
        icon={<EnvironmentOutlined />}
      />
      <Container fluid>
        {/* Phần thống kê tổng quan */}
        <Row className="map-stats-section g-4">
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card stations">
              <BsLightning className="stat-icon" />
              <div className="stat-number">
                {loading ? "..." : mapStats.totalStations}
              </div>
              <div className="stat-label">Tổng số trạm sạc</div>
            </Card>
          </Col>
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card sessions">
              <BsClock className="stat-icon" />
              <div className="stat-number">
                {loading ? "..." : mapStats.availableStations}
              </div>
              <div className="stat-label">Số trạm sạc trống</div>
            </Card>
          </Col>
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card users">
              <BsPeople className="stat-icon" />
              <div className="stat-number">
                {loading ? "..." : mapStats.bookedStations}
              </div>
              <div className="stat-label">Số trạm đang sạc</div>
            </Card>
          </Col>
        </Row>

        {/* Phần nội dung chính - Bản đồ và Danh sách trạm sạc */}
        <Row className="map-main-content">
          {/* Cột bản đồ */}
          <Col lg={8} md={7}>
            <Card className="map-content-card">
              <div className="map-container">
                <GGMap />
              </div>
            </Card>
          </Col>

          {/* Cột danh sách trạm sạc */}
          <Col lg={4} md={5}>
            <Card className="map-content-card">
              <div className="stations-list-container">
                <div className="stations-list-header">
                  <h3 className="stations-list-title">Danh sách trạm sạc</h3>
                  <div className="stations-count">
                    {loading
                      ? "Đang tải..."
                      : `${chargingStations.length} trạm sạc gần bạn`}
                  </div>
                </div>

                <div className="stations-list">
                  {loading ? (
                    <div
                      className="loading-container"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                      }}
                    >
                      <div>Đang tải danh sách trạm sạc...</div>
                    </div>
                  ) : error ? (
                    <div
                      className="error-container"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#dc3545",
                        backgroundColor: "#f8d7da",
                        borderRadius: "8px",
                        margin: "1rem 0",
                      }}
                    >
                      <div style={{ marginBottom: "1rem" }}>❌ {error}</div>
                      <button
                        onClick={refreshStations}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : chargingStations.length === 0 ? (
                    <div
                      className="no-data-container"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                      }}
                    >
                      Không có trạm sạc nào trong khu vực này
                    </div>
                  ) : (
                    chargingStations.map((station) => (
                      <div
                        key={station.id}
                        className="station-item"
                        onClick={() => handleStationClick(station)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="station-header">
                          <h4 className="station-name">{station.name}</h4>
                          <span className={getStatusClass(station.status)}>
                            {getStatusText(station.status)}
                          </span>
                        </div>

                        <div className="station-details">
                          <div className="station-detail">
                            <BsGeoAlt className="station-detail-icon" />
                            <span className="station-distance">
                              {station.distance}
                            </span>
                          </div>
                          <div className="station-detail">
                            <BsLightning className="station-detail-icon" />
                            <span>
                              {station.availableSlots}/{station.totalSlots}{" "}
                              trống
                            </span>
                          </div>
                          <div className="station-detail">
                            <BsBattery className="station-detail-icon" />
                            <span>{station.power}</span>
                          </div>
                          <div className="station-detail">
                            <BsSpeedometer2 className="station-detail-icon" />
                            <span>{station.type}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal hiển thị chi tiết trạm sạc */}
      <StationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        station={selectedStation}
      />
    </div>
  );
}

export default MapPage;

/**
 * MAP PAGE COMPONENT
 *
 * Trang chính hiển thị bản đồ trạm sạc và giao diện quản lý
 *
 * Tính năng:
 * - Bản đồ tương tác với các trạm sạc
 * - Dashboard thống kê theo thời gian thực
 * - Danh sách trạm với khả năng lọc
 * - Modal chi tiết trạm
 * - Thiết kế responsive cho mọi thiết bị
 *
 * @component
 */

import React, { useState, useMemo } from "react";

// UI Framework Components
import { Container, Row, Col, Card } from "react-bootstrap";

// Custom Hooks
import { useChargingStations } from "../hooks/useChargingStations.js";

// Child Components
import StationModal from "../components/station/StationModal.jsx";
import GGMap from "../components/map/Map.jsx";
import PageHeader from "../components/PageHeader";
import { LoadingSpinner } from "../components/common";

// Icons
import {
  BsLightning,
  BsPeople,
  BsGeoAlt,
  BsClock,
  BsBattery,
  BsSpeedometer2,
} from "react-icons/bs";
import { EnvironmentOutlined } from "@ant-design/icons";

// Styles
import "../assets/styles/MapPage.css";
import "../assets/styles/utilities.css";

/**
 * Main Map Page Component
 *
 * Render giao diện bản đồ trạm sạc với thống kê và danh sách trạm
 */
function MapPage() {
  // ===== HOOKS: Lấy dữ liệu trạm sạc và thống kê =====
  const {
    stations: chargingStations,
    statistics: mapStats,
    loading,
    error,
    refresh: refreshStations,
    fetchStationPosts,
  } = useChargingStations({
    autoFetch: true, // Tự động tải dữ liệu khi component mount
    useLocation: true, // Tự động lấy vị trí người dùng và tính khoảng cách
  });

  // ===== STATE: Quản lý modal chi tiết trạm =====
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // ===== FUNCTION: Chuyển đổi trạng thái sang tiếng Việt =====
  const getStatusText = (status) => {
    const statusMap = {
      available: "Còn trống",
      busy: "Đang sử dụng",
      maintenance: "Bảo trì",
    };
    return statusMap[status] || "Không xác định";
  };

  // ===== FUNCTION: Lấy CSS class cho styling trạng thái =====
  const getStatusClass = (status) => {
    return `station-status ${status}`;
  };

  // ===== FUNCTION: Xử lý click vào trạm - tải thông tin chi tiết và hiển thị modal =====
  const handleStationClick = async (station) => {
    try {
      // Lấy thông tin chi tiết các charging posts của trạm
      const stationPosts = await fetchStationPosts(station.id);

      // Kết hợp dữ liệu trạm với thông tin posts
      const stationWithPosts = {
        ...station,
        posts: stationPosts,
      };

      setSelectedStation(stationWithPosts);
      setShowModal(true);
    } catch (error) {
      // Hiển thị modal với thông tin cơ bản của trạm nếu không tải được posts
      setSelectedStation(station);
      setShowModal(true);
    }
  };

  // ===== FUNCTION: Xử lý đóng modal - reset trạng thái trạm đã chọn =====
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };

  // ===== Derived: Sắp xếp danh sách trạm - active trước, rồi theo khoảng cách gần nhất =====
  const sortedStations = useMemo(() => {
    if (!chargingStations || chargingStations.length === 0)
      return chargingStations;

    const parseDistance = (d) => {
      if (d == null) return Infinity;
      if (typeof d === "number") return d;
      if (typeof d === "string") {
        const trimmed = d.trim();
        if (trimmed === "N/A" || trimmed === "Đang tính..." || trimmed === "")
          return Infinity;
        const normalized = trimmed.replace(/,/g, ".");
        const num = parseFloat(normalized);
        if (isNaN(num)) return Infinity;
        if (/km/i.test(trimmed)) return num * 1000;
        return num; // assume meters
      }
      return Infinity;
    };

    const isActive = (s) => {
      if (!s) return false;
      if (
        Array.isArray(s.chargingSessionIds) &&
        s.chargingSessionIds.length > 0
      )
        return true;
      if (typeof s.active === "boolean") return s.active === true;
      if (s.status === "busy" || s.status === "in_use") return true;
      return false;
    };

    return [...chargingStations].sort((a, b) => {
      const aActive = isActive(a);
      const bActive = isActive(b);
      if (aActive !== bActive) return aActive ? -1 : 1;

      const da = parseDistance(a.distance);
      const db = parseDistance(b.distance);
      if (da === db) return 0;
      return da - db;
    });
  }, [chargingStations]);

  // ===== RENDER: Giao diện chính =====
  return (
    <div className="map-page-container">
      {/* Header trang */}
      <PageHeader title="Bản đồ trạm sạc" icon={<EnvironmentOutlined />} />

      <Container fluid>
        {/* Phần tổng quan thống kê */}
        <Row className="map-stats-section">
          {/* Thống kê: Tổng số trạm sạc */}
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card total-stations">
              <BsLightning
                style={{ color: "#10b981", fontSize: "30px" }}
                className="stat-icon"
              />
              <div className="stat-number">
                {loading ? "..." : mapStats.totalStations}
              </div>
              <div className="stat-label">Tổng số trạm sạc</div>
            </Card>
          </Col>

          {/* Thống kê: Số trạm sạc trống */}
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card available-stations">
              <BsClock
                style={{ color: "#10b981", fontSize: "30px" }}
                className="stat-icon"
              />
              <div className="stat-number">
                {loading ? "..." : mapStats.availableStations}
              </div>
              <div className="stat-label">Số trạm sạc trống</div>
            </Card>
          </Col>

          {/* Thống kê: Số trạm đang bảo trì */}
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card busy-stations">
              <BsPeople
                style={{ color: "#10b981", fontSize: "30px" }}
                className="stat-icon"
              />
              <div className="stat-number">
                {loading ? "..." : mapStats.bookedStations}
              </div>
              <div className="stat-label">Số trạm đang bảo trì</div>
            </Card>
          </Col>
        </Row>

        {/* Phần nội dung chính - Bản đồ và danh sách trạm */}
        <Row className="map-main-content">
          {/* Cột bản đồ */}
          <Col lg={8} md={7}>
            <Card className="map-content-card">
              <div className="map-container">
                <GGMap
                  style={{ color: "#10b981" }}
                  onStationClick={handleStationClick}
                />
              </div>
            </Card>
          </Col>

          {/* Cột danh sách trạm */}
          <Col lg={4} md={5}>
            <Card className="stations-list-card">
              <div className="stations-list-container">
                {/* Header danh sách */}
                <div className="stations-list-header">
                  <h3 className="stations-list-title">Danh sách trạm sạc</h3>
                  <div className="stations-count">
                    {loading
                      ? "Đang tải..."
                      : `${chargingStations.length} trạm sạc gần bạn`}
                  </div>
                </div>

                {/* Nội dung danh sách */}
                <div className="stations-list">
                  {/* Trạng thái: Đang tải */}
                  {loading ? (
                    <div className="stations-loading-state">
                      <LoadingSpinner
                        type="pulse"
                        size="medium"
                        color="primary"
                        text="Đang tải danh sách trạm sạc..."
                      />
                    </div>
                  ) : /* Trạng thái: Lỗi */
                  error ? (
                    <div className="stations-error-state">
                      <div className="error-message">❌ {error}</div>
                      <button
                        className="retry-button"
                        onClick={refreshStations}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : /* Trạng thái: Không có trạm */
                  chargingStations.length === 0 ? (
                    <div className="stations-empty-state">
                      <div className="empty-icon">🔍</div>
                      <div>Không có trạm sạc nào trong khu vực này</div>
                    </div>
                  ) : (
                    /* Danh sách các trạm sạc */
                    sortedStations.map((station) => (
                      <div
                        key={station.id}
                        className="station-list-item"
                        onClick={() => handleStationClick(station)}
                      >
                        {/* Header trạm: Tên và trạng thái */}
                        <div className="station-header">
                          <h4 className="station-name">{station.name}</h4>
                          <span className={getStatusClass(station.status)}>
                            {getStatusText(station.status)}
                          </span>
                        </div>

                        {/* Grid 2x2 cho thông tin chính */}
                        <div className="station-stats-grid">
                          {/* Khoảng cách */}
                          <div className="station-stat-item">
                            <BsGeoAlt
                              style={{ color: "#10b981" }}
                              className="stat-icon"
                            />
                            <span className="stat-value-map">
                              {station.distance || "Đang tính..."}
                            </span>
                          </div>

                          {/* Số slot trống/tổng số */}
                          <div className="station-stat-item">
                            <BsLightning
                              style={{ color: "#10b981" }}
                              className="stat-icon"
                            />
                            <span className="stat-value-map">
                              {(
                                (station.status === "maintenance" || station.active === false)
                                  ? 0
                                  : (station.availableSlots ?? 0)
                              )}/{station.totalSlots} trống
                            </span>
                          </div>

                          {/* Loại sạc - Hiển thị nếu khác AC/DC */}
                          {station.chargingTypes &&
                            station.chargingTypes !== "AC/DC" && (
                              <div className="station-stat-item station-stat-item--type">
                                <BsSpeedometer2
                                  style={{ color: "#10b981" }}
                                  className="stat-icon"
                                />
                                <span className="stat-value-map">
                                  {station.chargingTypes}
                                </span>
                              </div>
                            )}

                          {/* Phiên đang hoạt động - Chỉ hiển thị nếu có */}
                          {station.chargingSessionIds &&
                            station.chargingSessionIds.length > 0 && (
                              <div className="station-stat-item station-stat-item--sessions">
                                <BsBattery
                                  style={{ color: "#10b981" }}
                                  className="stat-icon"
                                />
                                <span className="stat-value-map">
                                  {station.chargingSessionIds.length} Phiên đã
                                  sạc
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Địa chỉ - Chiều rộng đầy đủ ở dưới cùng */}
                        <div className="station-address">
                          <BsGeoAlt
                            style={{ color: "#10b981" }}
                            className="station-address-icon"
                          />
                          <span className="station-address-text">
                            {station.address}
                          </span>
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

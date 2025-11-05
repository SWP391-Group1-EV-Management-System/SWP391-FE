/**
 * MAP PAGE COMPONENT
 *
 * Main page for displaying charging stations map and management interface.
 *
 * Features:
 * - Interactive map with charging stations
 * - Real-time statistics dashboard
 * - Station list with filtering capabilities
 * - Station detail modal
 * - Responsive design for all devices
 *
 * @component
 */

import React, { useState } from "react";

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
 * Renders the charging stations map interface with statistics and station list
 */
function MapPage() {
  /**
   * ===============================
   * DATA MANAGEMENT
   * ===============================
   */

  // Fetch charging stations data and statistics
  const {
    stations: chargingStations,
    statistics: mapStats,
    loading,
    error,
    refresh: refreshStations,
    fetchStationPosts,
    userLocation, // Vị trí người dùng
  } = useChargingStations({
    autoFetch: true, // Auto-load data on component mount
    useLocation: true, // Tự động lấy vị trí người dùng và tính khoảng cách
  });

  /**
   * ===============================
   * LOCAL STATE
   * ===============================
   */

  // Modal state for station details
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  /**
   * ===============================
   * UTILITY FUNCTIONS
   * ===============================
   */

  /**
   * Convert station status to Vietnamese display text
   *
   */
  const getStatusText = (status) => {
    const statusMap = {
      available: "Còn trống",
      busy: "Đang sử dụng",
      maintenance: "Bảo trì",
    };
    return statusMap[status] || "Không xác định";
  };

  /**
   * Get CSS class name for station status styling
   *
   */
  const getStatusClass = (status) => {
    return `station-status ${status}`;
  };

  /**
   * ===============================
   * EVENT HANDLERS
   * ===============================
   */

  /**
   * Handle station item click - loads detailed information and shows modal
   *
   */
  const handleStationClick = async (station) => {
    try {
      // Fetch detailed charging posts information for the station
      const stationPosts = await fetchStationPosts(station.id);

      // Combine station data with posts information
      const stationWithPosts = {
        ...station,
        posts: stationPosts,
      };

      setSelectedStation(stationWithPosts);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading station details:", error);

      // Show modal with basic station info even if posts loading fails
      setSelectedStation(station);
      setShowModal(true);
    }
  };

  /**
   * Handle modal close - resets selected station state
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };

  /**
   * ===============================
   * RENDER COMPONENT
   * ===============================
   */
  return (
    <div className="map-page-container">
      <PageHeader title="Bản đồ trạm sạc" icon={<EnvironmentOutlined />} />
      <Container fluid>
        {/* Statistics Overview Section */}
        <Row className="map-stats-section">
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

        {/* Main Content Section - Map and Station List */}
        <Row className="map-main-content">
          {/* Map Column */}
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

          {/* Station List Column */}
          <Col lg={4} md={5}>
            <Card className="stations-list-card">
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
                    <div className="stations-loading-state">
                      <LoadingSpinner
                        type="pulse"
                        size="medium"
                        color="primary"
                        text="Đang tải danh sách trạm sạc..."
                      />
                    </div>
                  ) : error ? (
                    <div className="stations-error-state">
                      <div className="error-message">❌ {error}</div>
                      <button
                        className="retry-button"
                        onClick={refreshStations}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : chargingStations.length === 0 ? (
                    <div className="stations-empty-state">
                      <div className="empty-icon">🔍</div>
                      <div>Không có trạm sạc nào trong khu vực này</div>
                    </div>
                  ) : (
                    chargingStations.map((station) => (
                      <div
                        key={station.id}
                        className="station-list-item"
                        onClick={() => handleStationClick(station)}
                      >
                        <div className="station-header">
                          <h4 className="station-name">{station.name}</h4>
                          <span className={getStatusClass(station.status)}>
                            {getStatusText(station.status)}
                          </span>
                        </div>

                        {/* Grid 2x2 for main stats */}
                        <div className="station-stats-grid">
                          {/* Distance - always show */}
                          <div className="station-stat-item">
                            <BsGeoAlt
                              style={{ color: "#10b981" }}
                              className="stat-icon"
                            />
                            <span className="stat-value-map">
                              {station.distance || "Đang tính..."}
                            </span>
                          </div>

                          {/* Available/Total slots */}
                          <div className="station-stat-item">
                            <BsLightning
                              style={{ color: "#10b981" }}
                              className="stat-icon"
                            />
                            <span className="stat-value-map">
                              {station.availableSlots}/{station.totalSlots}{" "}
                              trống
                            </span>
                          </div>

                          {/* Charging Types - Show unique types */}
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

                          {/* Active sessions - only if exists */}
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

                        {/* Address - Full width at bottom */}
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

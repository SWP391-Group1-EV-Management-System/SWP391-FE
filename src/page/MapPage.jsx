/**
 * MapPage Component
 * Displays charging station map and list with statistics overview
 * Features: Statistics cards, Map placeholder, Charging stations list
 */

import React, { useState, useEffect } from "react";

// React Bootstrap Components
import {
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";

// Custom Components
import StationModal from "../components/station/StationModal.jsx";

// Bootstrap Icons
import {
  BsLightning,
  BsMap,
  BsPeople,
  BsCheck2Circle,
  BsGeoAlt,
  BsClock,
  BsBattery,
  BsSpeedometer2,
  BsBookmark,
} from "react-icons/bs";

// Component Styles
import "../assets/styles/MapPage.css";

/**
 * MapPage Functional Component
 * @returns {JSX.Element} The rendered map page
 */
function MapPage() {
  // ==================== STATE MANAGEMENT ====================
  
  const [mapStats, setMapStats] = useState({
    totalStations: 42,
    bookedStations: 8,
    availableStations: 34
  });

  // Modal state management
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  const [chargingStations, setChargingStations] = useState([
    {
      id: 1,
      name: "Trạm sạc Vincom Center",
      status: "available",
      distance: "0.5 km",
      totalSlots: 8,
      availableSlots: 6,
      power: "22 kW",
      type: "AC",
      address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      phone: "024 3936 4368",
      operatingHours: "24/7",
      chargers: [
        { id: 101, name: "Trụ A1", status: "available", power: "22 kW", type: "AC", bookedUsers: 0 },
        { id: 102, name: "Trụ A2", status: "busy", power: "22 kW", type: "AC", bookedUsers: 1 },
        { id: 103, name: "Trụ A3", status: "available", power: "22 kW", type: "AC", bookedUsers: 0 },
        { id: 104, name: "Trụ A4", status: "available", power: "22 kW", type: "AC", bookedUsers: 2 }
      ]
    },
    {
      id: 2,
      name: "Trạm sạc Times City",
      status: "busy",
      distance: "1.2 km", 
      totalSlots: 12,
      availableSlots: 2,
      power: "50 kW",
      type: "DC Fast",
      address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
      phone: "024 3577 1010",
      operatingHours: "6:00 - 22:00",
      chargers: [
        { id: 201, name: "Trụ B1", status: "busy", power: "50 kW", type: "DC Fast", bookedUsers: 2 },
        { id: 202, name: "Trụ B2", status: "busy", power: "50 kW", type: "DC Fast", bookedUsers: 1 },
        { id: 203, name: "Trụ B3", status: "available", power: "50 kW", type: "DC Fast", bookedUsers: 0 },
        { id: 204, name: "Trụ B4", status: "available", power: "50 kW", type: "DC Fast", bookedUsers: 1 }
      ]
    },
    {
      id: 3,
      name: "Trạm sạc Royal City",
      status: "available",
      distance: "2.1 km",
      totalSlots: 6,
      availableSlots: 6,
      power: "22 kW", 
      type: "AC",
      address: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
      phone: "024 3557 5555",
      operatingHours: "24/7",
      chargers: [
        { id: 301, name: "Trụ C1", status: "available", power: "22 kW", type: "AC", bookedUsers: 0 },
        { id: 302, name: "Trụ C2", status: "available", power: "22 kW", type: "AC", bookedUsers: 1 },
        { id: 303, name: "Trụ C3", status: "available", power: "22 kW", type: "AC", bookedUsers: 0 }
      ]
    },
    {
      id: 4,
      name: "Trạm sạc Big C Thăng Long",
      status: "maintenance",
      distance: "3.5 km",
      totalSlots: 4,
      availableSlots: 0,
      power: "22 kW",
      type: "AC", 
      address: "222 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      phone: "024 3796 5588",
      operatingHours: "8:00 - 22:00"
      // Không có chargers array - sẽ sử dụng fallback UI
    },
    {
      id: 5,
      name: "Trạm sạc Lotte Tower",
      status: "available",
      distance: "1.8 km",
      totalSlots: 10,
      availableSlots: 8,
      power: "50 kW",
      type: "DC Fast",
      address: "54 Liễu Giai, Ba Đình, Hà Nội",
      phone: "024 3333 2222",
      operatingHours: "24/7"
      // Không có chargers array - sẽ sử dụng fallback UI
    }
  ]);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Get status display text in Vietnamese
   */
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

  /**
   * Get status CSS class
   */
  const getStatusClass = (status) => {
    return `station-status ${status}`;
  };

  /**
   * Handle station click to show modal
   */
  const handleStationClick = (station) => {
    setSelectedStation(station);
    setShowModal(true);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };

  // ==================== RENDER COMPONENT ====================

  return (
    <div className="map-page-container">
      <Container fluid>
        {/* Statistics Overview Section */}
        <Row className="map-stats-section g-4">
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card stations">
              <BsLightning className="stat-icon" />
              <div className="stat-number">194</div>
              <div className="stat-label">Tổng số trụ sạc</div>
            </Card>
          </Col>
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card sessions">
              <BsClock className="stat-icon" />
              <div className="stat-number">976</div>
              <div className="stat-label">Số trụ sạc trống</div>
            </Card>
          </Col>
          <Col lg={4} md={4} sm={12}>
            <Card className="map-stat-card users">
              <BsPeople className="stat-icon" />
              <div className="stat-number">6.996</div>
              <div className="stat-label">Số người đã đặt trụ</div>
            </Card>
          </Col>
        </Row>

        {/* Main Content Section - Map & Stations List */}
        <Row className="map-main-content">
          {/* Map Column */}
          <Col lg={8} md={7}>
            <Card className="map-content-card">
              <div className="map-container">
                <div className="map-placeholder">
                  <BsMap className="map-placeholder-icon" />
                  <div className="map-placeholder-text">Bản đồ trụ sạc</div>
                  <div className="map-placeholder-subtext">
                    Khu vực để tích hợp API Maps
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Charging Stations List Column */}
          <Col lg={4} md={5}>
            <Card className="map-content-card">
              <div className="stations-list-container">
                <div className="stations-list-header">
                  <h3 className="stations-list-title">Danh sách trụ sạc</h3>
                  <div className="stations-count">
                    {chargingStations.length} trụ sạc gần bạn
                  </div>
                </div>
                
                <div className="stations-list">
                  {chargingStations.map((station) => (
                    <div 
                      key={station.id} 
                      className="station-item"
                      onClick={() => handleStationClick(station)}
                      style={{ cursor: 'pointer' }}
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
                          <span className="station-distance">{station.distance}</span>
                        </div>
                        <div className="station-detail">
                          <BsLightning className="station-detail-icon" />
                          <span>{station.availableSlots}/{station.totalSlots} trống</span>
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
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Station Details Modal */}
      <StationModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        station={selectedStation}
      />
    </div>
  );
}

export default MapPage;

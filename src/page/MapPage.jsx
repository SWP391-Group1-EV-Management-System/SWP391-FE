/**
 * MapPage Component
 * Displays charging station map and list with statistics overview
 * Features: Statistics cards, Map placeholder, Charging stations list
 */

import React, { useState, useEffect } from "react";

// React Bootstrap Components
import { Container, Row, Col, Card } from "react-bootstrap";

// Custom Components
import StationModal from "../components/station/StationModal.jsx";
import GGMap from "../components/map/Map.jsx";

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
    availableStations: 34,
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
      email: "support@vincom-charging.vn",
      openHours: "Mở cửa 24/7",
      totalBookings: 15,
      rating: 4.5,
      reviewCount: 124,
      fastChargingPrice: "3,200",
      normalChargingPrice: "2,500",
      amenities: ["WiFi", "Cafe", "Parking", "Security"],
      chargers: [
        {
          id: 101,
          name: "Trụ A1",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 3,
        },
        {
          id: 102,
          name: "Trụ A2",
          status: "busy",
          power: "22 kW",
          type: "AC",
          bookings: 5,
          estimatedWaitTime: 25,
        },
        {
          id: 103,
          name: "Trụ A3",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 2,
        },
        {
          id: 104,
          name: "Trụ A4",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 4,
        },
      ],
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
      email: "info@timescity-ev.com",
      openHours: "6:00 - 22:00",
      totalBookings: 28,
      rating: 4.2,
      reviewCount: 89,
      fastChargingPrice: "3,800",
      normalChargingPrice: "3,000",
      amenities: ["WiFi", "Shop", "Parking"],
      chargers: [
        {
          id: 201,
          name: "Trụ B1",
          status: "busy",
          power: "50 kW",
          type: "DC Fast",
          bookings: 8,
          estimatedWaitTime: 15,
        },
        {
          id: 202,
          name: "Trụ B2",
          status: "busy",
          power: "50 kW",
          type: "DC Fast",
          bookings: 6,
          estimatedWaitTime: 35,
        },
        {
          id: 203,
          name: "Trụ B3",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 4,
        },
        {
          id: 204,
          name: "Trụ B4",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 7,
        },
      ],
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
      email: "charging@royalcity.vn",
      openHours: "Mở cửa 24/7",
      totalBookings: 12,
      rating: 4.7,
      reviewCount: 56,
      fastChargingPrice: "3,400",
      normalChargingPrice: "2,700",
      amenities: ["WiFi", "Cafe", "Shop", "Parking", "Security"],
      chargers: [
        {
          id: 301,
          name: "Trụ C1",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 2,
        },
        {
          id: 302,
          name: "Trụ C2",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 5,
        },
        {
          id: 303,
          name: "Trụ C3",
          status: "available",
          power: "22 kW",
          type: "AC",
          bookings: 1,
        },
      ],
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
      email: "support@bigc-charging.vn",
      openHours: "8:00 - 22:00",
      totalBookings: 0,
      rating: 4.0,
      reviewCount: 23,
      fastChargingPrice: "3,500",
      normalChargingPrice: "2,800",
      amenities: ["WiFi", "Shop", "Parking"],
      chargers: [
        {
          id: 401,
          name: "Trụ D1",
          status: "maintenance",
          power: "22 kW",
          type: "AC",
          bookings: 0,
          maintenanceNote: "Đang bảo trì hệ thống điện",
        },
        {
          id: 402,
          name: "Trụ D2",
          status: "maintenance",
          power: "22 kW",
          type: "AC",
          bookings: 0,
          maintenanceNote: "Thay thế cáp sạc",
        },
        {
          id: 403,
          name: "Trụ D3",
          status: "maintenance",
          power: "22 kW",
          type: "AC",
          bookings: 0,
          maintenanceNote: "Cập nhật phần mềm",
        },
        {
          id: 404,
          name: "Trụ D4",
          status: "maintenance",
          power: "22 kW",
          type: "AC",
          bookings: 0,
          maintenanceNote: "Kiểm tra định kỳ",
        },
      ],
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
      email: "ev@lotte.vn",
      openHours: "Mở cửa 24/7",
      totalBookings: 22,
      rating: 4.8,
      reviewCount: 167,
      fastChargingPrice: "4,000",
      normalChargingPrice: "3,200",
      amenities: ["WiFi", "Cafe", "Shop", "Parking", "Security"],
      chargers: [
        {
          id: 501,
          name: "Trụ E1",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 1,
        },
        {
          id: 502,
          name: "Trụ E2",
          status: "busy",
          power: "50 kW",
          type: "DC Fast",
          bookings: 4,
          estimatedWaitTime: 20,
        },
        {
          id: 503,
          name: "Trụ E3",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 2,
        },
        {
          id: 504,
          name: "Trụ E4",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 3,
        },
        {
          id: 505,
          name: "Trụ E5",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 0,
        },
        {
          id: 506,
          name: "Trụ E6",
          status: "busy",
          power: "50 kW",
          type: "DC Fast",
          bookings: 5,
          estimatedWaitTime: 12,
        },
        {
          id: 507,
          name: "Trụ E7",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 1,
        },
        {
          id: 508,
          name: "Trụ E8",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 2,
        },
        {
          id: 509,
          name: "Trụ E9",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 3,
        },
        {
          id: 510,
          name: "Trụ E10",
          status: "available",
          power: "50 kW",
          type: "DC Fast",
          bookings: 1,
        },
      ],
    },
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
                <GGMap />
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
                            {station.availableSlots}/{station.totalSlots} trống
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

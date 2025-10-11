/**
 * Interactive Map Component for EV Charging Stations
 *
 * Features:
 * - Display charging stations on map using OpenStreetMap + Leaflet
 * - Auto-detect user location on component mount
 * - Click stations to set as destination
 * - Calculate and display routes with polylines
 * - Real-time station status and availability
 *
 * @component
 */

import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Row,
  Col,
  Card,
  Typography,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  CloseOutlined,
  AimOutlined,
  CompassOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { useChargingStations } from "../../hooks/useChargingStations.js";
import "../../assets/styles/LeafletMap.css";
import "../../assets/styles/Map.css";
import "../../assets/styles/utilities.css";

const { Text } = Typography;

/**
 * ===============================
 * CONSTANTS & ICON CONFIGURATIONS
 * ===============================
 */

// Default map center (Ho Chi Minh City, Vietnam)
const DEFAULT_CENTER = [10.7769, 106.7009];

// Fix for Leaflet default marker icons (required for bundlers like Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom SVG icon for user's current location (green bullseye design)
const userLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64=" +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#52c41a" stroke="#fff" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="#fff"/>
      <circle cx="12" cy="12" r="2" fill="#52c41a"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

/**
 * Map Controller Component
 * Handles programmatic map view changes (center and zoom)
 *
 * @param {Array} center - [latitude, longitude] coordinates
 * @param {number} zoom - Zoom level (1-20)
 */
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
}

/**
 * Main Map Component
 *
 * @param {Function} onStationClick - Optional callback when station is clicked for details
 */
function GGMap({ onStationClick }) {
  /**
   * ===============================
   * STATE MANAGEMENT
   * ===============================
   */

  // Map view controls
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

  // Route planning states
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });
  const [routePath, setRoutePath] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // User location states
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Fetch charging stations data from API
  const { stations, loading, error } = useChargingStations({ autoFetch: true });

  /**
   * ===============================
   * EFFECTS & INITIALIZATION
   * ===============================
   */

  // Auto-detect user location on component mount (silent mode)
  useEffect(() => {
    getUserLocation(true); // true = don't show success/error messages
  }, []);

  // Auto-fill origin field when user location is available
  useEffect(() => {
    if (userLocation && !origin) {
      setOrigin("Vị trí hiện tại");
    }
  }, [userLocation, origin]);

  /**
   * ===============================
   * UTILITY FUNCTIONS
   * ===============================
   */

  /**
   * Generate a curved route path between two coordinate points
   * Creates a natural-looking route with multiple waypoints
   *
   * @param {Array} startCoords - [lat, lng] of starting point
   * @param {Array} endCoords - [lat, lng] of ending point
   * @returns {Array} Array of coordinate points for the route
   */
  const generateRoutePath = (startCoords, endCoords) => {
    const [lat1, lng1] = startCoords;
    const [lat2, lng2] = endCoords;
    const points = [];
    const steps = 20; // Number of waypoints for smooth curve

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;

      // Linear interpolation between start and end points
      const lat = lat1 + (lat2 - lat1) * ratio;
      const lng = lng1 + (lng2 - lng1) * ratio;

      // Add slight sine curve offset for natural appearance
      const curveOffset = Math.sin(ratio * Math.PI) * 0.005;
      points.push([lat + curveOffset, lng + curveOffset]);
    }

    return points;
  };

  /**
   * ===============================
   * ROUTE CALCULATION FUNCTIONS
   * ===============================
   */

  /**
   * Calculate route between origin and destination
   * Uses Haversine formula for distance calculation
   * Generates visual route path on map
   */
  const calculateRoute = async () => {
    // Validation
    if (!origin || !destination) {
      message.warning("Vui lòng nhập điểm xuất phát và đích đến");
      return;
    }

    setIsCalculatingRoute(true);

    try {
      // Find the selected charging station
      const selectedStation = stations.find(
        (station) =>
          destination.includes(station.name) ||
          station.name.includes(destination)
      );

      let distance = "~5.2 km";
      let duration = "~12 phút";
      let routeCoords = [];

      if (selectedStation && userLocation) {
        // Calculate real distance using Haversine formula
        const lat1 = userLocation[0];
        const lng1 = userLocation[1];
        const lat2 = selectedStation.lat;
        const lng2 = selectedStation.lng;

        const R = 6371; // Earth's radius in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const calculatedDistance = R * c;

        // Format distance and estimated duration
        distance = `${calculatedDistance.toFixed(1)} km`;
        duration = `${Math.round(calculatedDistance * 2.5)} phút`; // Estimate: 2.5 min per km

        // Generate visual route path
        routeCoords = generateRoutePath(userLocation, [
          selectedStation.lat,
          selectedStation.lng,
        ]);
      } else if (selectedStation) {
        // Fallback: route from default center to station
        routeCoords = generateRoutePath(DEFAULT_CENTER, [
          selectedStation.lat,
          selectedStation.lng,
        ]);
      }

      // Simulate API processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update route state
      setRouteInfo({ distance, duration });
      setRoutePath(routeCoords);

      message.success(`Đã tính toán lộ trình: ${distance}, ${duration}`);
    } catch (error) {
      console.error("Route calculation error:", error);
      message.error("Không thể tính toán lộ trình");
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  /**
   * Clear all route data and reset form
   */
  const clearRoute = () => {
    setOrigin("");
    setDestination("");
    setRouteInfo({ distance: "", duration: "" });
    setRoutePath([]);
  };

  /**
   * Handle clicking on a charging station marker
   * Sets station as destination and prepares for route calculation
   *
   * @param {Object} station - Charging station data object
   */
  const handleStationClick = (station) => {
    // Set selected station as destination
    setDestination(station.name);

    // Auto-fill origin with user location if available
    if (userLocation && !origin) {
      setOrigin("Vị trí hiện tại");
    }

    // Focus map on selected station
    setMapCenter([station.lat, station.lng]);
    setMapZoom(16);

    // Notify user
    message.success(
      `Đã chọn "${station.name}" làm điểm đến. Nhấn "Tính đường đi" để xem lộ trình.`
    );
  };

  /**
   * ===============================
   * GEOLOCATION FUNCTIONS
   * ===============================
   */

  /**
   * Get user's current location using Geolocation API
   *
   * @param {boolean} isAutomatic - If true, suppress success/error messages
   */
  const getUserLocation = (isAutomatic = false) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const errorMsg = "Trình duyệt không hỗ trợ định vị GPS";
      setLocationError(errorMsg);
      if (!isAutomatic) {
        message.error(errorMsg);
      }
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    // Request user's current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = [latitude, longitude];

        // Update state with user location
        setUserLocation(userPos);
        setMapCenter(userPos);
        setMapZoom(15);
        setIsGettingLocation(false);

        // Show success message only for manual requests
        if (!isAutomatic) {
          message.success("Đã lấy được vị trí hiện tại!");
        }
      },
      (error) => {
        // Handle different types of geolocation errors
        let errorMessage = "Không thể lấy vị trí hiện tại";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Vui lòng cho phép truy cập vị trí trong trình duyệt";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Thông tin vị trí không khả dụng";
            break;
          case error.TIMEOUT:
            errorMessage = "Quá thời gian chờ lấy vị trí";
            break;
          default:
            errorMessage = "Lỗi không xác định khi lấy vị trí";
            break;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);

        // Show error message only for manual requests
        if (!isAutomatic) {
          message.error(errorMessage);
        }
      },
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // 10 second timeout
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  };

  /**
   * Center map view on user's current location
   */
  const centerToUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
      message.success("Đã di chuyển đến vị trí của bạn");
    } else {
      message.warning(
        "Chưa có vị trí người dùng. Nhấn nút định vị để lấy vị trí hiện tại."
      );
      getUserLocation();
    }
  };

  /**
   * ===============================
   * MARKER & UI UTILITY FUNCTIONS
   * ===============================
   */

  /**
   * Generate custom icon for charging station based on status
   *
   * @param {string} status - Station status: 'available', 'busy', 'maintenance'
   * @returns {L.Icon} Leaflet icon object
   */
  const getStationIcon = (status) => {
    // Color mapping for different station statuses
    const color =
      status === "available"
        ? "#52c41a" // Green for available
        : status === "busy"
        ? "#ff4d4f" // Red for busy
        : "#faad14"; // Orange for maintenance

    return new L.Icon({
      iconUrl:
        "data:image/svg+xml;base64=" +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
          <path d="M8 6h3l-4 7h3l-2 5" fill="#fff" stroke="#fff" stroke-width="1"/>
        </svg>
      `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  /**
   * Convert status code to Vietnamese display text
   *
   * @param {string} status - Station status code
   * @returns {string} Localized status text
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
   * ===============================
   * RENDER COMPONENT
   * ===============================
   */
  return (
    <div className="map-wrapper">
      {/* Main Map Container */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Route Polyline */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: "#1890ff",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 5",
            }}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="map-user-popup">
                <h4>📍 Vị trí của bạn</h4>
                <p>
                  Tọa độ: {userLocation[0].toFixed(6)},{" "}
                  {userLocation[1].toFixed(6)}
                </p>
                <Button
                  size="small"
                  type="primary"
                  onClick={centerToUserLocation}
                >
                  Chỉ đường đến đây
                </Button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charging Station Markers */}
        {stations
          .filter((station) => station.lat && station.lng)
          .map((station) => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={getStationIcon(station.status)}
              eventHandlers={{
                click: () => handleStationClick(station),
              }}
            >
              <Popup>
                <div className="map-station-popup">
                  <h4>⚡ {station.name}</h4>
                  <p className="station-address">📍 {station.address}</p>
                  <div className="station-status-row">
                    <span className={`station-status-badge ${station.status}`}>
                      {getStatusText(station.status)}
                    </span>
                    <span className="station-slots-info">
                      {station.availableSlots}/{station.totalSlots} trống
                    </span>
                  </div>
                  <div className="station-info-row">
                    <span>
                      <strong>Công suất:</strong> {station.power}
                    </span>
                    <span>
                      <strong>Loại:</strong> {station.type}
                    </span>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    block
                    onClick={() => handleStationClick(station)}
                  >
                    🗺️ Chỉ đường đến đây
                  </Button>
                  {onStationClick && (
                    <Button
                      type="default"
                      size="small"
                      block
                      onClick={() => onStationClick(station)}
                      style={{ marginTop: "4px" }}
                    >
                      📋 Xem chi tiết
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Control Panel */}
      <Card className="map-control-panel">
        <Space direction="vertical" size="small" className="full-width">
          {/* Instructions */}
          <div className="map-instructions">
            💡 <strong>Cách sử dụng:</strong> Click vào trạm sạc trên bản đồ để
            chọn điểm đến, sau đó nhấn "Tính đường đi"
          </div>

          <Row gutter={[8, 8]} align="middle">
            <Col span={24}>
              <Input
                className="map-origin-input"
                placeholder="Điểm xuất phát (Click nút định vị để lấy vị trí hiện tại)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                prefix={<EnvironmentOutlined />}
                size="small"
              />
            </Col>
            <Col span={24}>
              <Input
                className={`map-destination-input ${
                  destination ? "selected" : ""
                }`}
                placeholder="Điểm đến (Click trạm sạc trên bản đồ để chọn)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                prefix={<EnvironmentOutlined />}
                size="small"
              />
            </Col>
            <Col span={24}>
              <div className="map-button-group">
                <Button
                  className="map-calculate-button"
                  type="primary"
                  onClick={calculateRoute}
                  size="small"
                  loading={isCalculatingRoute}
                  icon={isCalculatingRoute ? <LoadingOutlined /> : null}
                >
                  {isCalculatingRoute ? "Đang tính..." : "Tính đường đi"}
                </Button>
                <Button
                  className="map-clear-button"
                  icon={<CloseOutlined />}
                  onClick={clearRoute}
                  size="small"
                  title="Xóa đường đi"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<AimOutlined />}
                  onClick={centerToUserLocation}
                  title="Về vị trí người dùng"
                  size="small"
                />
                <Button
                  className={`map-location-button ${
                    userLocation ? "" : "inactive"
                  }`}
                  type="default"
                  shape="circle"
                  icon={<CompassOutlined />}
                  onClick={getUserLocation}
                  title="Lấy vị trí hiện tại"
                  size="small"
                  loading={isGettingLocation}
                />
              </div>
            </Col>
          </Row>

          {/* Route Info */}
          {(routeInfo.distance || routeInfo.duration) && (
            <div className="map-route-info">
              <Row gutter={[8, 8]} align="middle">
                <Col span={12}>
                  <Text strong className="map-route-distance">
                    📏 {routeInfo.distance}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong className="map-route-duration">
                    ⏱️ {routeInfo.duration}
                  </Text>
                </Col>
              </Row>
              {routePath.length > 0 && (
                <div className="map-route-status">
                  ✅ Đường đi được hiển thị trên bản đồ
                </div>
              )}
            </div>
          )}
        </Space>
      </Card>

      {/* Loading/Error States */}
      {loading && (
        <div className="map-loading-overlay">
          <Text>Đang tải trạm sạc...</Text>
        </div>
      )}

      {error && <div className="map-error-notification">Lỗi: {error}</div>}

      {locationError && (
        <div
          className={`map-location-error ${error ? "with-other-error" : ""}`}
        >
          📍 {locationError}
        </div>
      )}
    </div>
  );
}

export default GGMap;

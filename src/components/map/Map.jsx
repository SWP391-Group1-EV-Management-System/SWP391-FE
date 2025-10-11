/**
 * Thành phần bản đồ trạm sạc xe điện
 * 
 * Tính năng:
 * - Hiển thị trạm sạc trên OpenStreetMap với Leaflet
 * - Markers động theo trạng thái (available/busy/maintenance)
 * - Popup chi tiết trạm sạc
 * - Nút định vị người dùng
 * - Loading & error handling
 */

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useChargingStations } from "../../hooks/useChargingStations.js";
import "../../assets/styles/LeafletMap.css";
import "../../assets/styles/Map.css";
import "../../assets/styles/utilities.css";

// ==================== HẰNG SỐ ====================

const DEFAULT_CENTER = [10.7769, 106.7009]; // Tọa độ trung tâm TP.HCM
const DEFAULT_ZOOM = 13; // Mức zoom mặc định
const LOCATE_ZOOM = 16; // Mức zoom khi định vị người dùng

const STATION_STATUS = {
  AVAILABLE: "available",
  BUSY: "busy",
  MAINTENANCE: "maintenance"
};

const STATUS_COLORS = {
  [STATION_STATUS.AVAILABLE]: "#52c41a",
  [STATION_STATUS.BUSY]: "#ff4d4f",
  [STATION_STATUS.MAINTENANCE]: "#faad14"
};

const STATUS_LABELS = {
  [STATION_STATUS.AVAILABLE]: "Còn trống",
  [STATION_STATUS.BUSY]: "Đang sử dụng",
  [STATION_STATUS.MAINTENANCE]: "Bảo trì"
};

// ==================== ICON SETUP ====================

// Fix icon marker mặc định của Leaflet khi dùng với Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// ==================== UTILITIES ====================

/**
 * Tạo icon trạm sạc theo trạng thái
 */
const createStationIcon = (status) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS[STATION_STATUS.MAINTENANCE];
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
      <path d="M8 6h3l-4 7h3l-2 5" fill="#fff" stroke="#fff" stroke-width="1"/>
    </svg>
  `;

  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

/**
 * Lấy text trạng thái tiếng Việt
 */
const getStatusText = (status) => STATUS_LABELS[status] || "Không xác định";

// ==================== COMPONENTS ====================

/**
 * Nút định vị người dùng (sử dụng Leaflet native API)
 */
function LocateControl() {
  const map = useMap();

  useMapEvents({
    locationfound(e) {
      const marker = L.marker(e.latlng).addTo(map);
      const coords = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
      marker
        .bindPopup(`<b>📍 Vị trí của bạn</b><br/>Tọa độ: ${coords}`)
        .openPopup();
      map.setView(e.latlng, LOCATE_ZOOM);
    },
    locationerror(e) {
      L.popup()
        .setLatLng(map.getCenter())
        .setContent(`Không thể lấy vị trí: ${e.message}`)
        .openOn(map);
    }
  });

  useEffect(() => {
    const locateBtn = L.control({ position: "bottomleft" });
    
    locateBtn.onAdd = function() {
      const btn = L.DomUtil.create("button", "leaflet-bar leaflet-control leaflet-control-custom");
      btn.innerHTML = "📍";
      btn.title = "Về vị trí của tôi";
      Object.assign(btn.style, {
        background: "#1890ff",
        color: "#fff",
        width: "40px",
        height: "40px",
        border: "none",
        borderRadius: "50%",
        fontSize: "22px",
        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
        cursor: "pointer"
      });
      btn.onclick = () => map.locate({ setView: true, maxZoom: LOCATE_ZOOM, enableHighAccuracy: true });
      return btn;
    };
    
    locateBtn.addTo(map);
    return () => locateBtn.remove();
  }, [map]);

  return null;
}

/**
 * Popup thông tin trạm sạc
 */
function StationPopupContent({ station, onStationClick }) {
  return (
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
        <span><strong>Công suất:</strong> {station.power}</span>
        <span><strong>Loại:</strong> {station.type}</span>
      </div>
      
      {onStationClick && (
        <button
          className="ant-btn ant-btn-default ant-btn-sm"
          style={{ marginTop: "4px", width: "100%" }}
          onClick={() => onStationClick(station)}
        >
          📋 Xem chi tiết
        </button>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

/**
 * Component bản đồ trạm sạc
 * 
 * @param {Function} onStationClick - Callback khi click "Xem chi tiết"
 */
function Map({ onStationClick }) {
  const { stations, loading, error } = useChargingStations({ autoFetch: true });

  // Lọc chỉ các trạm có tọa độ hợp lệ
  const validStations = stations.filter(s => s.lat && s.lng);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocateControl />
        
        {validStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={createStationIcon(station.status)}
          >
            <Popup>
              <StationPopupContent 
                station={station} 
                onStationClick={onStationClick} 
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="map-loading-overlay">
          Đang tải trạm sạc...
        </div>
      )}
      
      {error && (
        <div className="map-error-notification">
          Lỗi: {error}
        </div>
      )}
    </div>
  );
}

export default Map;
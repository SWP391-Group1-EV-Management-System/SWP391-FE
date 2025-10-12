/**
 * Thành phần bản đồ với tự động định vị
 * 
 * Tính năng:
 * - Tự động lấy vị trí người dùng khi load trang
 * - Hiển thị marker vị trí người dùng
 * - Hiển thị bản đồ OpenStreetMap với Leaflet
 */

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "../../assets/styles/LeafletMap.css";
import "../../assets/styles/Map.css";
import "../../assets/styles/utilities.css";

// ==================== HẰNG SỐ ====================

const DEFAULT_CENTER = [10.7769, 106.7009]; // Tọa độ trung tâm TP.HCM
const DEFAULT_ZOOM = 13; // Mức zoom mặc định
const LOCATE_ZOOM = 16; // Mức zoom khi định vị người dùng

// ==================== ICON SETUP ====================

// Fix icon marker mặc định của Leaflet khi dùng với Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// ==================== COMPONENTS ====================

/**
 * Component tự động định vị khi load
 */
function AutoLocate() {
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
        .setContent(`⚠️ Không thể lấy vị trí: ${e.message}`)
        .openOn(map);
      console.error("Lỗi định vị:", e.message);
    }
  });

  useEffect(() => {
    const locateBtn = L.control({ position: "bottomleft" });
    // Tự động lấy vị trí khi component mount
    map.locate({ 
      setView: true, 
      maxZoom: LOCATE_ZOOM, 
      enableHighAccuracy: true 
    });
    // Tạo nút định vị thủ công
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

// ==================== MAIN COMPONENT ====================

/**
 * Component bản đồ với tự động định vị
 */
function Map() {
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
        
        <AutoLocate />
      </MapContainer>
    </div>
  );
}

export default Map;
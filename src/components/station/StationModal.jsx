/**
 * StationModal Component
 * Modal displaying detailed charging station information and booking interface
 */

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { BsXLg, BsLightning, BsGeoAlt, BsClock, BsPeople, BsStarFill } from "react-icons/bs";

const StationModal = ({ isOpen, onClose, station }) => {
  if (!isOpen || !station) return null;

  const handleBookCharger = (chargerId) => {
    alert(`Đã đặt chỗ trụ sạc ${chargerId} tại ${station.name}!`);
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-modal-backdrop)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          zIndex: "var(--z-modal)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: "15px",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "#333",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            {station.name}
          </h4>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              padding: "5px",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BsXLg />
          </button>
        </div>

        {/* Station Info */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              color: "#666",
            }}
          >
            <BsGeoAlt style={{ marginRight: "8px", fontSize: "1.1rem" }} />
            <span>{station.address}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              color: "#666",
            }}
          >
            <BsClock style={{ marginRight: "8px", fontSize: "1.1rem" }} />
            <span>{station.openHours || "Mở cửa 24/7"}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              color: "#666",
            }}
          >
            <BsPeople style={{ marginRight: "8px", fontSize: "1.1rem" }} />
            <span>
              {station.totalBookings || 0} người đã đặt chỗ hôm nay
            </span>
          </div>
          {station.rating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#666",
              }}
            >
              <BsStarFill style={{ marginRight: "8px", fontSize: "1.1rem", color: "#ffc107" }} />
              <span>{station.rating}/5 ({station.reviewCount || 0} đánh giá)</span>
            </div>
          )}
        </div>

        {/* Station Details */}
        <div style={{ marginBottom: "24px" }}>
          <h5
            style={{
              marginBottom: "15px",
              color: "#333",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            Thông tin chi tiết
          </h5>
          
          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <div
                style={{
                  color: "#333",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Tiện ích
              </div>
              <div style={{ marginLeft: "0px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {station.amenities.map((amenity, index) => {
                  const getAmenityIcon = (amenity) => {
                    switch (amenity.toLowerCase()) {
                      case 'wifi': return '📶';
                      case 'cafe': case 'coffee': return '☕';
                      case 'shop': case 'store': return '🏪';
                      case 'parking': return '🚗';
                      case 'security': return '🛡️';
                      default: return '🔧';
                    }
                  };
                  
                  return (
                    <span
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        borderRadius: "16px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      {getAmenityIcon(amenity) && (
                        <span style={{ marginRight: "4px" }}>
                          {getAmenityIcon(amenity)}
                        </span>
                      )}
                      {amenity}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(station.phone || station.email) && (
            <div style={{ marginBottom: "15px" }}>
              <div
                style={{
                  color: "#333",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Liên hệ
              </div>
              <div style={{ marginLeft: "0px", color: "#666", fontSize: "0.9rem" }}>
                {station.phone && (
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ marginRight: "6px", fontSize: "0.9rem" }}>📞</span>
                    {station.phone}
                  </div>
                )}
                {station.email && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "6px", fontSize: "0.9rem" }}>✉️</span>
                    {station.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chargers List */}
        <div>
          <h5
            style={{
              marginBottom: "15px",
              color: "#333",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            Danh sách trụ sạc ({station.chargers?.length || station.totalSlots || 0})
          </h5>
          <div style={{ display: "grid", gap: "10px" }}>
            {station.chargers?.length > 0 ? (
              station.chargers.map((charger) => (
              <div
                key={charger.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <BsLightning
                      style={{
                        marginRight: "8px",
                        fontSize: "1.1rem",
                        color: "#28a745",
                      }}
                    />
                    <strong>Trụ {charger.id}</strong>
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      backgroundColor:
                        charger.status === "available" ? "#d4edda" : "#f8d7da",
                      color:
                        charger.status === "available" ? "#155724" : "#721c24",
                    }}
                  >
                    {charger.status === "available"
                      ? "Sẵn sàng"
                      : "Đang sử dụng"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    <div>Công suất: {charger.power}</div>
                    <div>Loại: {charger.type}</div>
                    {charger.bookings && (
                      <div style={{ fontSize: "0.85rem", color: "#28a745", fontWeight: "500" }}>
                        {charger.bookings} lượt đặt hôm nay
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {charger.estimatedWaitTime && charger.status !== "available" && (
                      <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "5px" }}>
                        Còn ~{charger.estimatedWaitTime} phút
                      </div>
                    )}
                    <Button
                      variant={
                        charger.status === "available" ? "success" : "secondary"
                      }
                      size="sm"
                      disabled={charger.status !== "available"}
                      onClick={() => handleBookCharger(charger.id)}
                      style={{
                        minWidth: "80px",
                        fontWeight: "500",
                      }}
                    >
                      {charger.status === "available" ? "Đặt chỗ" : "Đã đặt"}
                    </Button>
                  </div>
                </div>
              </div>
              ))
            ) : (
              // Fallback UI khi không có thông tin chi tiết về chargers
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <BsLightning
                    style={{
                      fontSize: "2rem",
                      color: "#28a745",
                      marginBottom: "10px",
                    }}
                  />
                </div>
                <div style={{ color: "#333", marginBottom: "5px" }}>
                  <strong>{station.totalSlots || 0} trụ sạc</strong>
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "10px" }}>
                  Công suất: {station.power} | Loại: {station.type}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#28a745", fontWeight: "500", marginBottom: "15px" }}>
                  {station.availableSlots || 0} trụ còn trống
                </div>
                <Button
                  variant={station.status === "available" ? "success" : "secondary"}
                  disabled={station.status !== "available"}
                  onClick={() => handleBookCharger("general")}
                  style={{
                    fontWeight: "500",
                  }}
                >
                  {station.status === "available" ? "Đặt chỗ" : 
                   station.status === "maintenance" ? "Bảo trì" : "Đầy chỗ"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal bằng createPortal để đặt nó ở root level
  return createPortal(modalContent, document.body);
};

export default StationModal;

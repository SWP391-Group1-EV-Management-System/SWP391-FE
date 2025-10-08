/**
 * StationModal Component
 * Modal displaying detailed charging station information and booking interface
 */

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { 
  IoClose, 
  IoLocationOutline, 
  IoTimeOutline, 
  IoPeopleOutline, 
  IoStarSharp,
  IoFlashOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWifiOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
  IoCafeOutline,
  IoPowerOutline,
  IoSpeedometerOutline,
  IoCardOutline
} from "react-icons/io5";
import { useStationPosts } from "../../hooks/useStationPosts";
import "../../assets/styles/StationModal.css";

const StationModal = ({ isOpen, onClose, station }) => {
  // Hook để lấy danh sách trụ sạc với mock data
  const { posts, loading, error, statistics } = useStationPosts(station?.id);

  if (!isOpen || !station) return null;

  const handleBookCharger = (postId) => {
    alert(`Đã đặt chỗ trụ sạc ${postId} tại ${station.name}!`);
  };

  // Enhanced amenity icons mapping
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return IoWifiOutline;
    if (amenityLower.includes('cafe') || amenityLower.includes('coffee')) return IoCafeOutline;
    if (amenityLower.includes('shop') || amenityLower.includes('store')) return IoStorefrontOutline;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return IoCarOutline;
    if (amenityLower.includes('security')) return IoShieldCheckmarkOutline;
    return IoStorefrontOutline; // Default
  };

  const modalContent = (
    <div className="station-modal-backdrop" onClick={onClose}>
      <div className="station-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="station-modal__header">
          <h4 className="station-modal__title">{station.name}</h4>
          <button onClick={onClose} className="station-modal__close-btn">
            <IoClose />
          </button>
        </div>

        {/* Station Info */}
        <div className="station-info">
          <div className="station-info__item">
            <IoLocationOutline className="station-info__icon" />
            <span>{station.address}</span>
          </div>
          <div className="station-info__item">
            <IoTimeOutline className="station-info__icon" />
            <span>{station.openHours || "Mở cửa 24/7"}</span>
          </div>
          <div className="station-info__item">
            <IoPeopleOutline className="station-info__icon" />
            <span>{station.totalBookings || 0} người đã đặt chỗ hôm nay</span>
          </div>
          {station.rating && (
            <div className="station-info__item">
              <IoStarSharp className="station-info__icon station-info__icon--star" />
              <span>{station.rating}/5 ({station.reviewCount || 0} đánh giá)</span>
            </div>
          )}
        </div>

        {/* Station Details */}
        <div className="station-details" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Realtime Statistics */}
          {posts.length > 0 && (
            <div className="station-details__section" style={{ marginBottom: '20px', width: '100%' }}>
              <div className="station-details__section-title">Thông tin chi tiết</div>
              <div className="statistics-grid">
                <div className="statistics-item statistics-item--available">
                  <div className="statistics-number statistics-number--available">
                    {statistics.available}
                  </div>
                  <div className="statistics-label statistics-number--available">Sẵn sàng</div>
                </div>
                <div className="statistics-item statistics-item--busy">
                  <div className="statistics-number statistics-number--busy">
                    {statistics.busy}
                  </div>
                  <div className="statistics-label statistics-number--busy">Đang sạc</div>
                </div>
                <div className="statistics-item statistics-item--inactive">
                  <div className="statistics-number statistics-number--inactive">
                    {statistics.inactive}
                  </div>
                  <div className="statistics-label statistics-number--inactive">Không hoạt động</div>
                </div>
                <div className="statistics-item statistics-item--total">
                  <div className="statistics-number statistics-number--total">
                    {statistics.total}
                  </div>
                  <div className="statistics-label statistics-number--total">Tổng cộng</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <div className="station-details__section" style={{ marginTop: '10px', width: '100%' }}>
              <div className="station-details__section-title">Tiện ích</div>
              <div className="amenities-list">
                {station.amenities.map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  
                  return (
                    <span key={index} className="amenity-tag">
                      <IconComponent className="amenity-icon" />
                      {amenity}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chargers List */}
        <div>
          <h5 className="chargers-section__title">
            Danh sách trụ sạc ({posts.length > 0 ? posts.length : station.totalSlots || 0})
            {loading && <span className="chargers-loading-text"> - Đang tải...</span>}
          </h5>
          
          {error && <div className="chargers-error">{error}</div>}
          
          <div className="chargers-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
              <div key={post.id} className="charger-item">
                <div className="charger-item__header">
                  <div className="charger-item__title">
                    <IoPowerOutline className={`charger-item__icon ${post.isActive ? 'charger-item__icon--active' : 'charger-item__icon--inactive'}`} />
                    <strong>Trụ {post.id}</strong>
                  </div>
                  <div className="charger-item__status-area">
                    {post.isActive ? (
                      <IoCheckmarkCircle className="charger-status-icon charger-status-icon--active" />
                    ) : (
                      <IoCloseCircle className="charger-status-icon charger-status-icon--inactive" />
                    )}
                    <span className={`charger-status-badge ${
                      post.isAvailable ? 'charger-status-badge--available' : 
                      post.isActive ? 'charger-status-badge--busy' : 'charger-status-badge--inactive'
                    }`}>
                      {post.isAvailable ? "Sẵn sàng" : 
                       post.isActive ? "Đang sử dụng" : "Không hoạt động"}
                    </span>
                  </div>
                </div>
                <div className="charger-item__content">
                  <div className="charger-item__details">
                    <div>
                      <IoFlashOutline style={{marginRight: '6px', fontSize: '1.3rem'}} />
                      Công suất: {post.powerDisplay}
                    </div>
                    <div>
                      <IoCardOutline style={{marginRight: '6px', fontSize: '1.3rem'}} />
                      Giá: {post.feeDisplay}
                    </div>
                    {post.supportedTypes?.length > 0 && (
                      <div>
                        <IoSpeedometerOutline style={{marginRight: '6px', fontSize: '1.3rem'}} />
                        Loại: {post.supportedTypes.join(", ")}
                      </div>
                    )}
                    {post.currentSession && (
                      <div className="charger-session-warning">
                        <IoTimeOutline style={{marginRight: '6px', fontSize: '1.3rem'}} />
                        Đang có session hoạt động
                      </div>
                    )}
                  </div>
                  <div className="charger-item__action">
                    <Button
                      variant={post.isAvailable ? "success" : "secondary"}
                      size="sm"
                      disabled={!post.isAvailable}
                      onClick={() => handleBookCharger(post.id)}
                      className="charger-book-btn"
                    >
                      {post.isAvailable ? "Đặt chỗ" : "Không khả dụng"}
                    </Button>
                  </div>
                </div>
              </div>
              ))
            ) : loading ? (
              // Loading state
              <div className="charger-empty-state">
                <div>
                  <IoPowerOutline className="charger-empty-state__icon charger-empty-state__icon--loading" />
                </div>
                <div>Đang tải danh sách trụ sạc...</div>
              </div>
            ) : (
              // Empty state - không có trụ sạc
              <div className="charger-empty-state">
                <div>
                  <IoPowerOutline className="charger-empty-state__icon" />
                </div>
                <div className="charger-empty-state__title">
                  <strong>Chưa có thông tin chi tiết trụ sạc</strong>
                </div>
                <div className="charger-empty-state__subtitle">
                  Tổng số trụ: {station.totalSlots || 0}
                </div>
                <div className="charger-empty-state__info">
                  Khả dụng: {station.availableSlots || 0} trụ
                </div>
                <Button
                  variant={station.status === "available" ? "success" : "secondary"}
                  disabled={station.status !== "available"}
                  onClick={() => handleBookCharger("general")}
                  className="charger-empty-state__btn"
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

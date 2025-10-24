import React, { useState, useEffect } from "react";
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
  IoCardOutline,
} from "react-icons/io5";
import { useStationPosts } from "../../hooks/useStationPosts";
import useBooking from "../../services/bookingService";
import useCar from "../../hooks/useCar";
import { useAuth } from "../../hooks/useAuth";
import "../../assets/styles/StationModal.css";

const StationModal = ({ isOpen, onClose, station }) => {
  const { posts, loading, error, statistics } = useStationPosts(station?.id);
  const { createBooking: createBookingApi, loading: bookingLoading } = useBooking();
  const { getCarsByUser, loading: carLoading } = useCar();
  const { user: currentUser } = useAuth();
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [userCars, setUserCars] = useState([]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const loadUserCars = async () => {
        try {
          const userId = currentUser.id || currentUser.userID;
          const result = await getCarsByUser(userId);
          
          // Xử lý response
          let cars = [];
          
          if (Array.isArray(result)) {
            cars = result;
          } else if (result?.success && Array.isArray(result.data)) {
            cars = result.data;
          } else if (result?.data && Array.isArray(result.data)) {
            cars = result.data;
          } else if (result && typeof result === 'object' && !Array.isArray(result)) {
            cars = [result];
          }
          
          setUserCars(cars);
          
          if (cars.length > 0) {
            const firstCar = cars[0];
            const carId = firstCar.carID || firstCar.carId || firstCar.id;
            setSelectedCar(carId);
          }
        } catch (err) {
          console.error("Error loading user cars:", err);
        }
      };
      
      loadUserCars();
    }
    
    // Reset khi đóng modal
    if (!isOpen) {
      setUserCars([]);
      setSelectedCar(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !station) return null;

  const handleBookCharger = async (postId) => {
    try {
      if (!currentUser) {
        alert('Vui lòng đăng nhập trước khi đặt chỗ.');
        return;
      }

      if (!selectedCar) {
        alert('Bạn chưa có xe. Vui lòng thêm xe để đặt chỗ.');
        return;
      }

      const payload = {
        user: currentUser.id || currentUser.userID,
        chargingPost: postId,
        car: selectedCar,
      };

      const res = await createBookingApi(payload);

      if (res?.success) {
        const resultCode = res.data;
        if (resultCode === -1) {
          alert(`Trụ ${postId} đang đầy. Bạn đã được thêm vào danh sách chờ.`);
        } else {
          alert(`Đặt chỗ thành công cho trụ ${postId}!`);
        }
        onClose();
      } else {
        const msg = res?.error || 'Không thành công';
        alert(`Đặt chỗ thất bại: ${msg}`);
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Lỗi khi đặt chỗ, vui lòng thử lại sau.');
    }
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return IoWifiOutline;
    if (amenityLower.includes("cafe") || amenityLower.includes("coffee"))
      return IoCafeOutline;
    if (amenityLower.includes("shop") || amenityLower.includes("store"))
      return IoStorefrontOutline;
    if (amenityLower.includes("parking") || amenityLower.includes("car"))
      return IoCarOutline;
    if (amenityLower.includes("security")) return IoShieldCheckmarkOutline;
    return IoStorefrontOutline;
  };

  const modalContent = (
    <div className="station-modal-backdrop" onClick={onClose}>
      <div className="station-modal" onClick={(e) => e.stopPropagation()}>
        <div className="station-modal__header">
          <h4 className="station-modal__title">{station.name}</h4>
          <button onClick={onClose} className="station-modal__close-btn">
            <IoClose />
          </button>
        </div>

        {carLoading && (
          <div className="car-loading-info">
            <p>Đang tải thông tin xe...</p>
          </div>
        )}

        {!carLoading && userCars && userCars.length > 0 && (
          <div className="car-info">
            <IoCarOutline className="car-info-icon" />
            <span>
              Xe: {userCars[0].typeCar || userCars[0].carName || 'Xe của bạn'} 
              {userCars[0].licensePlate ? ` - ${userCars[0].licensePlate}` : ''}
            </span>
          </div>
        )}

        {!carLoading && (!userCars || userCars.length === 0) && currentUser && (
          <div className="car-warning">
            <p>⚠️ Bạn chưa có xe. Vui lòng thêm xe để đặt chỗ.</p>
          </div>
        )}

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
              <span>
                {station.rating}/5 ({station.reviewCount || 0} đánh giá)
              </span>
            </div>
          )}
        </div>

        <div className="station-details">
          {posts.length > 0 && (
            <div className="station-details__section">
              <div className="station-details__section-title">
                Thông tin chi tiết
              </div>
              <div className="statistics-grid">
                <div className="statistics-item statistics-item--available">
                  <div className="statistics-number statistics-number--available">
                    {statistics.available}
                  </div>
                  <div className="statistics-label statistics-number--available">
                    Sẵn sàng
                  </div>
                </div>
                <div className="statistics-item statistics-item--busy">
                  <div className="statistics-number statistics-number--busy">
                    {statistics.busy}
                  </div>
                  <div className="statistics-label statistics-number--busy">
                    Đang sạc
                  </div>
                </div>
                <div className="statistics-item statistics-item--inactive">
                  <div className="statistics-number statistics-number--inactive">
                    {statistics.inactive}
                  </div>
                  <div className="statistics-label statistics-number--inactive">
                    Không hoạt động
                  </div>
                </div>
                <div className="statistics-item statistics-item--total">
                  <div className="statistics-number statistics-number--total">
                    {statistics.total}
                  </div>
                  <div className="statistics-label statistics-number--total">
                    Tổng cộng
                  </div>
                </div>
              </div>
            </div>
          )}

          {station.amenities && station.amenities.length > 0 && (
            <div className="station-details__section--with-top-margin">
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

        <div>
          <h5 className="chargers-section__title">
            Danh sách trụ sạc (
            {posts.length > 0 ? posts.length : station.totalSlots || 0})
            {loading && (
              <span className="chargers-loading-text"> - Đang tải...</span>
            )}
          </h5>

          {error && <div className="chargers-error">{error}</div>}

          <div className="chargers-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="charger-item">
                  <div className="charger-item__header">
                    <div className="charger-item__title">
                      <IoPowerOutline
                        className={`charger-item__icon ${
                          post.active
                            ? "charger-item__icon--active"
                            : "charger-item__icon--inactive"
                        }`}
                      />
                      <strong>Trụ {post.id}</strong>
                    </div>
                    <div className="charger-item__status-area">
                      {post.active ? (
                        <IoCheckmarkCircle className="charger-status-icon charger-status-icon--active" />
                      ) : (
                        <IoCloseCircle className="charger-status-icon charger-status-icon--inactive" />
                      )}
                      <span
                        className={`charger-status-badge ${
                          post.isAvailable
                            ? "charger-status-badge--available"
                            : post.active
                            ? "charger-status-badge--busy"
                            : "charger-status-badge--inactive"
                        }`}
                      >
                        {post.isAvailable
                          ? "Sẵn sàng"
                          : post.active
                          ? "Đang sử dụng"
                          : "Không hoạt động"}
                      </span>
                    </div>
                  </div>
                  <div className="charger-item__content">
                    <div className="charger-item__details">
                      <div>
                        <IoFlashOutline className="charger-detail-icon" />
                        Công suất: {post.powerDisplay}
                      </div>
                      <div>
                        <IoCardOutline className="charger-detail-icon" />
                        Giá: {post.feeDisplay}
                      </div>
                      {post.supportedTypes?.length > 0 && (
                        <div>
                          <IoSpeedometerOutline className="charger-detail-icon" />
                          Loại: {post.supportedTypes.join(", ")}
                        </div>
                      )}
                      {post.currentSession && (
                        <div className="charger-session-warning">
                          <IoTimeOutline className="charger-detail-icon" />
                          Đang có session hoạt động
                        </div>
                      )}
                    </div>
                    <div className="charger-item__action">
                      <Button
                        variant={post.isAvailable ? "success" : "secondary"}
                        size="sm"
                        disabled={!post.isAvailable || bookingLoading || !selectedCar}
                        onClick={() => handleBookCharger(post.id)}
                        className="charger-book-btn"
                      >
                        {bookingLoading
                          ? "Đang xử lý..."
                          : !selectedCar
                          ? "Chưa có xe"
                          : post.isAvailable
                          ? "Đặt chỗ"
                          : "Không khả dụng"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : loading ? (
              <div className="charger-empty-state">
                <div>
                  <IoPowerOutline className="charger-empty-state__icon charger-empty-state__icon--loading" />
                </div>
                <div>Đang tải danh sách trụ sạc...</div>
              </div>
            ) : (
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
                  variant={
                    station.status === "available" ? "success" : "secondary"
                  }
                  disabled={station.status !== "available" || !selectedCar}
                  onClick={() => handleBookCharger("general")}
                  className="charger-empty-state__btn"
                >
                  {station.status === "available"
                    ? "Đặt chỗ"
                    : station.status === "maintenance"
                    ? "Bảo trì"
                    : "Đầy chỗ"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default StationModal;
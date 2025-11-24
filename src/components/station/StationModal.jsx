import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { notification } from "antd";
import { useNavigate } from "react-router";
import {
  IoClose,
  IoLocationOutline,
  IoTimeOutline,
  IoPeopleOutline,
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
import { Select } from "antd";
import { useStationPosts } from "../../hooks/useStationPosts";
import useBooking from "../../hooks/useBooking";
import useCar from "../../hooks/useCar";
import { useAuth } from "../../hooks/useAuth";
import BookingConfirmModal from "./BookingConfirmModal";
import "../../assets/styles/StationModal.css";

// Component: Modal hiển thị thông tin chi tiết trạm sạc và các trụ sạc
const StationModal = ({ isOpen, onClose, station }) => {
  // Hooks: Lấy dữ liệu trụ sạc, booking, xe và user
  const { posts, loading, error } = useStationPosts(station?.id);
  const { createBooking: createBookingApi, loading: bookingLoading } =
    useBooking();
  const { getCarsByUser } = useCar();
  const { user: currentUser } = useAuth();

  // State: Quản lý xe được chọn và trạng thái xử lý
  const [selectedCar, setSelectedCar] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [bookingProcessingId, setBookingProcessingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    post: null,
  });
  // Map charging type ids to display names (shared with service mapping)
  const CHARGING_TYPE_NAMES = { 1: "CCS", 2: "CHAdeMO", 3: "AC" };
  const navigate = useNavigate();

  // Chức năng: Merge trạng thái thực tế từ API vào danh sách trụ sạc
  const mergedPosts = posts.map((post) => {
    if (
      station?.chargingPostsAvailable &&
      post.id in station.chargingPostsAvailable
    ) {
      const actualAvailability = station.chargingPostsAvailable[post.id];
      return {
        ...post,
        isAvailable: actualAvailability,
      };
    }
    return post;
  });

  // Chức năng: Tính toán thống kê từ chargingPostsAvailable map
  const calculateStatsFromMap = (chargingPostsAvailable) => {
    if (!chargingPostsAvailable || typeof chargingPostsAvailable !== "object") {
      return { available: 0, busy: 0, total: 0 };
    }

    const postStatuses = Object.values(chargingPostsAvailable);
    const total = postStatuses.length;
    const available = postStatuses.filter((status) => status === true).length;
    const busy = total - available;

    return { available, busy, total, inactive: 0 };
  };

  // Chức năng: Tính toán và hiển thị thống kê trụ sạc
  const displayStats =
    mergedPosts.length > 0
      ? {
          total: mergedPosts.length,
          available: mergedPosts.filter((p) => p.isAvailable).length,
          busy: mergedPosts.filter((p) => !p.isAvailable && p.active).length,
          inactive: mergedPosts.filter((p) => !p.active).length,
        }
      : calculateStatsFromMap(station?.chargingPostsAvailable);

  // Kiểm tra xem có thông tin trụ sạc chi tiết hay không
  const hasDetailedPosts =
    mergedPosts.length > 0 ||
    (station?.chargingPostsAvailable &&
      Object.keys(station.chargingPostsAvailable).length > 0);

  // Chức năng: Tải danh sách xe của người dùng khi mở modal
  useEffect(() => {
    if (isOpen && currentUser) {
      const loadUserCars = async () => {
        try {
          const userId = currentUser.id || currentUser.userID;
          const result = await getCarsByUser(userId);

          // Xử lý response từ API (có thể trả về nhiều format khác nhau)
          let cars = [];

          if (Array.isArray(result)) {
            cars = result;
          } else if (result?.success && Array.isArray(result.data)) {
            cars = result.data;
          } else if (result?.data && Array.isArray(result.data)) {
            cars = result.data;
          } else if (
            result &&
            typeof result === "object" &&
            !Array.isArray(result)
          ) {
            cars = [result];
          }

          setUserCars(cars);

          // Tự động chọn xe đầu tiên nếu có
          if (cars.length > 0) {
            const firstCar = cars[0];
            const carId = firstCar.carID || firstCar.carId || firstCar.id;
            setSelectedCar(carId);
          }
        } catch (err) {
          // Silent error handling
        }
      };

      loadUserCars();
    }

    // Reset state khi đóng modal
    if (!isOpen) {
      setUserCars([]);
      setSelectedCar(null);
      setConfirmModal({ isOpen: false, post: null });
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !station) return null;

  // Compute selected car object and its charging type display name
  const selectedCarObj = userCars.find(
    (c) => (c.carID || c.carId || c.id) === selectedCar
  );
  const selectedCarChargingType = selectedCarObj
    ? CHARGING_TYPE_NAMES[selectedCarObj.chargingType] ||
      (selectedCarObj.chargingType || "N/A").toString()
    : null;

  // Chức năng: Mở modal xác nhận đặt chỗ
  const handleBookCharger = (postId) => {
    // Kiểm tra đăng nhập
    if (!currentUser) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập trước khi đặt chỗ.",
        duration: 3,
      });
      return;
    }

    // Kiểm tra xe đã chọn
    if (!selectedCar) {
      notification.warning({
        message: "Chưa có xe",
        description: "Bạn chưa có xe. Vui lòng thêm xe để đặt chỗ.",
        duration: 3,
      });
      return;
    }

    // Tìm thông tin trụ sạc (nếu có)
    const post = mergedPosts.find((p) => p.id === postId);

    // Lấy thông tin xe đã chọn
    const carObj = userCars.find(
      (c) => (c.carID || c.carId || c.id) === selectedCar
    );

    // Nếu không tìm thấy object xe, thông báo
    if (!carObj) {
      notification.warning({
        message: "Xe không hợp lệ",
        description: "Không tìm thấy thông tin xe đã chọn. Vui lòng thử lại.",
        duration: 3,
      });
      return;
    }

    // Nếu có post cụ thể, kiểm tra tính tương thích giữa loại sạc xe và trụ
    if (post) {
      // Map id -> tên (giống mapping trong service)
      const CHARGING_TYPE_NAMES = { 1: "CCS", 2: "CHAdeMO", 3: "AC" };

      const carTypeName =
        CHARGING_TYPE_NAMES[carObj.chargingType] ||
        (carObj.chargingType || "").toString();

      const supported = (post.supportedTypes || []).map((t) =>
        t.toString().toUpperCase()
      );

      if (
        carTypeName &&
        !supported.includes(carTypeName.toString().toUpperCase())
      ) {
        notification.error({
          message: "Đầu sạc không phù hợp",
          description: `Đầu sạc xe (${carTypeName}) không phù hợp với trụ (hỗ trợ: ${
            post.supportedTypes ? post.supportedTypes.join(", ") : "N/A"
          }).`,
          duration: 5,
        });
        return;
      }
    }

    // Mở modal xác nhận
    setConfirmModal({ isOpen: true, post: post });
  };

  // Chức năng: Xử lý xác nhận đặt chỗ từ modal
  const handleConfirmBooking = async () => {
    if (!confirmModal.post) return;

    const postId = confirmModal.post.id;

    try {
      setBookingProcessingId(postId);

      // Tạo payload cho API booking
      const payload = {
        user: currentUser.id || currentUser.userID,
        chargingPost: postId,
        car: selectedCar,
      };

      const res = await createBookingApi(payload);

      // Handle 'overpaying' response from backend: block booking
      if (
        res?.idAction === "overpaying" ||
        String(res?.status).toLowerCase().includes("overpay")
      ) {
        notification.error({
          message: "Không thể đặt chỗ",
          description:
            "Tài khoản của bạn đang có khoản nợ trên 100.000 VND. Vui lòng thanh toán trước khi đặt chỗ.",
          duration: 5,
        });
        setConfirmModal({ isOpen: false, post: null });
        setBookingProcessingId(null);
        return;
      }

      if (res?.success || res?.status) {
        const status = res.status?.toLowerCase();

        // Xử lý trường hợp: Trụ đầy - thêm vào danh sách chờ
        if (status === "waiting") {
          if (res.idAction) {
            localStorage.setItem("waitingListId", res.idAction);
            localStorage.setItem("bookingStatus", "waiting");

            if (res.rank !== undefined && res.rank !== null && res.rank > 0) {
              localStorage.setItem("initialQueueRank", res.rank.toString());
            }

            localStorage.setItem("queuePostId", postId);
          }

          notification.info({
            message: "Đã thêm vào danh sách chờ",
            description: `Trụ ${postId} đang đầy. Bạn đã được thêm vào danh sách chờ.`,
            duration: 3,
          });
          setConfirmModal({ isOpen: false, post: null });
          onClose();
          navigate("/app/waiting");
        } else if (status === "booking") {
          if (res.idAction) {
            localStorage.setItem("bookingId", res.idAction);
            localStorage.setItem("bookingStatus", "booking");
          }

          notification.success({
            message: "Đặt chỗ thành công",
            description: `Đặt chỗ thành công cho trụ ${postId}!`,
            duration: 2,
          });
          setConfirmModal({ isOpen: false, post: null });
          onClose();
          navigate("/app/booking");
        } else {
          notification.success({
            message: "Đặt chỗ thành công",
            description: "Đặt chỗ thành công!",
            duration: 2,
          });
          setConfirmModal({ isOpen: false, post: null });
          onClose();
          navigate("/app/booking");
        }
      } else {
        const msg = res?.error || "Không thành công";
        notification.error({
          message: "Đặt chỗ thất bại",
          description: msg,
          duration: 3,
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi đặt chỗ",
        description:
          err.response?.data?.message ||
          err.message ||
          "Lỗi khi đặt chỗ, vui lòng thử lại sau.",
        duration: 3,
      });
    } finally {
      setBookingProcessingId(null);
    }
  };

  // Chức năng: Lấy icon tiện ích theo tên
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

  // Hiển thị: Nội dung modal
  const modalContent = (
    <div className="station-modal-backdrop" onClick={onClose}>
      <div className="station-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header: Tiêu đề và nút đóng */}
        <div className="station-modal__header">
          <h4 className="station-modal__title">{station.name}</h4>
          <button onClick={onClose} className="station-modal__close-btn">
            <IoClose />
          </button>
        </div>

        {/* Section: Trạng thái trạm sạc */}
        <div className="station-status-section">
          <div className="station-status-badge-large">
            {station.active ? (
              <>
                <IoCheckmarkCircle className="status-icon status-icon--active" />
                <span className="status-text">Đang hoạt động</span>
              </>
            ) : (
              <>
                <IoCloseCircle className="status-icon status-icon--inactive" />
                <span className="status-text">Đang bảo trì</span>
              </>
            )}
          </div>

          {/* Hiển thị tọa độ GPS */}
          {station.lat && station.lng && (
            <div className="station-coordinates">
              📍 {station.lat.toFixed(6)}, {station.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Section: Thông tin chi tiết trạm sạc */}
        <div className="station-info">
          {/* Địa chỉ */}
          {station.address && (
            <div className="station-info__item">
              <IoLocationOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>{station.address}</span>
            </div>
          )}

          {/* Người quản lý */}
          {station.userManagerName && station.userManagerName !== "N/A" && (
            <div className="station-info__item">
              <IoPeopleOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>Quản lý: {station.userManagerName}</span>
            </div>
          )}

          {/* Số phiên sạc đang hoạt động */}
          {station.chargingSessionIds &&
            station.chargingSessionIds.length > 0 && (
              <div className="station-info__item">
                <IoFlashOutline
                  className="station-info__icon"
                  style={{ fontSize: "24px", color: "#10b981" }}
                />
                <span>
                  {station.chargingSessionIds.length} phiên sạc đang hoạt động
                </span>
              </div>
            )}

          {/* Khoảng cách */}
          {station.distance && station.distance !== "N/A" && (
            <div className="station-info__item">
              <IoLocationOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>Khoảng cách: {station.distance}</span>
            </div>
          )}

          {/* Ngày thành lập */}
          {station.establishedTime && (
            <div className="station-info__item">
              <IoTimeOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>
                Thành lập:{" "}
                {new Date(station.establishedTime).toLocaleDateString("vi-VN")}
              </span>
            </div>
          )}

          {/* Chọn xe của người dùng (chỉ hiển thị khi có trụ sạc chi tiết) */}
          {hasDetailedPosts && userCars && userCars.length > 0 && (
            <div className="station-info__item">
              <IoCarOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Chọn xe <span style={{ color: "#ff4d4f" }}>*</span>
                </label>
                <Select
                  value={selectedCar}
                  onChange={(val) => setSelectedCar(val)}
                  placeholder="Chọn xe để đặt chỗ"
                  style={{ width: "100%" }}
                >
                  {userCars.map((car) => {
                    const id = car.carID || car.carId || car.id;
                    const label = car.licensePlate
                      ? `${car.licensePlate} — ${car.typeCar || ""}`
                      : id;
                    return (
                      <Select.Option key={id} value={id}>
                        {label}
                      </Select.Option>
                    );
                  })}
                </Select>

                {/* Hiển thị loại sạc của xe đã chọn */}
                {selectedCar && (
                  <div style={{ marginTop: 8, color: "#374151" }}>
                    <strong>Loại sạc của xe:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {selectedCarChargingType || "N/A"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section: Thống kê trụ sạc */}
        <div className="station-details">
          <div className="station-details__section">
            <div className="station-details__section-title">
              {posts.length > 0 ? "Thông tin chi tiết" : "Tổng quan trạm sạc"}
            </div>
            <div className="statistics-grid">
              {/* Thống kê: Trụ sẵn sàng */}
              <div className="statistics-item statistics-item--available">
                <div className="statistics-number statistics-number--available">
                  {displayStats.available}
                </div>
                <div className="statistics-label statistics-number--available">
                  {posts.length > 0 ? "Sẵn sàng" : "Trụ trống"}
                </div>
              </div>
              {/* Thống kê: Trụ đang bận */}
              <div className="statistics-item statistics-item--busy">
                <div className="statistics-number statistics-number--busy">
                  {displayStats.busy}
                </div>
                <div className="statistics-label statistics-number--busy">
                  {posts.length > 0 ? "Đang bận" : "Đang sử dụng"}
                </div>
              </div>

              {/* Thống kê: Trụ không hoạt động */}
              {posts.length > 0 && displayStats.inactive > 0 && (
                <div className="statistics-item statistics-item--inactive">
                  <div className="statistics-number statistics-number--inactive">
                    {displayStats.inactive}
                  </div>
                  <div className="statistics-label statistics-number--inactive">
                    Không hoạt động
                  </div>
                </div>
              )}

              {/* Thống kê: Tổng số trụ */}
              <div className="statistics-item statistics-item--total">
                <div className="statistics-number statistics-number--total">
                  {displayStats.total}
                </div>
                <div className="statistics-label statistics-number--total">
                  Tổng cộng
                </div>
              </div>

              {/* Thống kê: Số phiên sạc */}
              {station.chargingSessionIds &&
                station.chargingSessionIds.length > 0 && (
                  <div className="statistics-item statistics-item--busy">
                    <div className="statistics-number statistics-number--busy">
                      {station.chargingSessionIds.length}
                    </div>
                    <div className="statistics-label statistics-number--busy">
                      Phiên sạc
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Section: Danh sách trụ sạc */}
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
            {/* Hiển thị: Danh sách trụ sạc chi tiết từ API */}
            {mergedPosts.length > 0 ? (
              mergedPosts.map((post) => (
                <div key={post.id} className="charger-item">
                  {/* Header trụ sạc: Tên và trạng thái */}
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
                  {/* Content trụ sạc: Thông tin và nút đặt chỗ */}
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
                      {(() => {
                        const isProcessing =
                          bookingLoading && bookingProcessingId === post.id;
                        return (
                          <Button
                            variant={post.isAvailable ? "success" : "warning"}
                            size="sm"
                            disabled={isProcessing || !selectedCar}
                            onClick={() => handleBookCharger(post.id)}
                            className="charger-book-btn"
                          >
                            {isProcessing
                              ? "Đang xử lý..."
                              : !selectedCar
                              ? "Chưa có xe"
                              : "Đặt chỗ"}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))
            ) : loading ? (
              // Hiển thị: Loading state
              <div className="charger-empty-state">
                <div>
                  <IoPowerOutline className="charger-empty-state__icon charger-empty-state__icon--loading" />
                </div>
                <div>Đang tải danh sách trụ sạc...</div>
              </div>
            ) : station.chargingPostsAvailable &&
              Object.keys(station.chargingPostsAvailable).length > 0 ? (
              // Hiển thị: Danh sách trụ sạc từ chargingPostsAvailable map (fallback)
              Object.entries(station.chargingPostsAvailable).map(
                ([postId, isAvailable]) => (
                  <div key={postId} className="charger-item">
                    <div className="charger-item__header">
                      <div className="charger-item__title">
                        <IoPowerOutline
                          className={`charger-item__icon ${
                            isAvailable
                              ? "charger-item__icon--active"
                              : "charger-item__icon--busy"
                          }`}
                        />
                        <strong>Trụ {postId}</strong>
                      </div>
                      <div className="charger-item__status-area">
                        {isAvailable ? (
                          <IoCheckmarkCircle className="charger-status-icon charger-status-icon--active" />
                        ) : (
                          <IoCloseCircle className="charger-status-icon charger-status-icon--busy" />
                        )}
                        <span
                          className={`charger-status-badge ${
                            isAvailable
                              ? "charger-status-badge--available"
                              : "charger-status-badge--busy"
                          }`}
                        >
                          {isAvailable ? "Sẵn sàng" : "Đang bận"}
                        </span>
                      </div>
                    </div>
                    <div className="charger-item__content">
                      <div className="charger-item__details">
                        <div className="charger-detail-info">
                          Thông tin chi tiết đang tải...
                        </div>
                      </div>
                      <div className="charger-item__action">
                        {(() => {
                          const isProcessing =
                            bookingLoading && bookingProcessingId === postId;
                          return (
                            <Button
                              variant={isAvailable ? "success" : "warning"}
                              size="sm"
                              disabled={isProcessing || !selectedCar}
                              onClick={() => handleBookCharger(postId)}
                              className="charger-book-btn"
                            >
                              {isProcessing
                                ? "Đang xử lý..."
                                : !selectedCar
                                ? "Chưa có xe"
                                : "Đặt chỗ"}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              // Hiển thị: Empty state khi không có dữ liệu chi tiết - ẨN NÚT ĐẶT CHỖ
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
                {/* ĐÃ XÓA NÚT ĐẶT CHỖ Ở ĐÂY */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Nếu confirm modal đang mở thì ẩn station modal để tránh chồng modal */}
      {!confirmModal.isOpen && createPortal(modalContent, document.body)}

      {confirmModal.isOpen &&
        createPortal(
          <BookingConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, post: null })}
            onConfirm={handleConfirmBooking}
            post={confirmModal.post}
            station={station}
            selectedCar={selectedCar}
            userCars={userCars}
            isProcessing={
              bookingLoading && bookingProcessingId === confirmModal.post?.id
            }
          />,
          document.body
        )}
    </>
  );
};

export default StationModal;

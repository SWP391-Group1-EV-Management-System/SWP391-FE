import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
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
import useBooking from "../../hooks/useBooking";
import useCar from "../../hooks/useCar";
import { useAuth } from "../../hooks/useAuth";
import "../../assets/styles/StationModal.css";

const StationModal = ({ isOpen, onClose, station }) => {
  const { posts, loading, error, statistics } = useStationPosts(station?.id);
  const { createBooking: createBookingApi, loading: bookingLoading } =
    useBooking();
  const { getCarsByUser, loading: carLoading } = useCar();
  const { user: currentUser } = useAuth();

  const [selectedCar, setSelectedCar] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [bookingProcessingId, setBookingProcessingId] = useState(null);
  const navigate = useNavigate();

  // ⭐ Merge trạng thái thực tế từ chargingPostsAvailable map vào posts array
  const mergedPosts = posts.map((post) => {
    // Nếu có chargingPostsAvailable map từ station data
    if (
      station?.chargingPostsAvailable &&
      post.id in station.chargingPostsAvailable
    ) {
      // Lấy trạng thái thật từ map (true/false)
      const actualAvailability = station.chargingPostsAvailable[post.id];
      return {
        ...post,
        isAvailable: actualAvailability, // ⭐ Ghi đè với trạng thái thật từ map
      };
    }
    return post; // Giữ nguyên nếu không có trong map
  });

  // ⭐ Tính statistics từ chargingPostsAvailable map (từ API /all)
  const calculateStatsFromMap = (chargingPostsAvailable) => {
    if (!chargingPostsAvailable || typeof chargingPostsAvailable !== "object") {
      return { available: 0, busy: 0, total: 0 };
    }

    const postStatuses = Object.values(chargingPostsAvailable);
    const total = postStatuses.length;
    const available = postStatuses.filter((status) => status === true).length;
    const busy = total - available;

    console.log("📊 [StationModal] Calculating stats from map:", {
      chargingPostsAvailable,
      postStatuses,
      total,
      available,
      busy,
    });

    return { available, busy, total, inactive: 0 };
  };

  // Sử dụng stats từ posts API hoặc fallback sang map từ station data
  const displayStats =
    mergedPosts.length > 0
      ? {
          total: mergedPosts.length,
          available: mergedPosts.filter((p) => p.isAvailable).length,
          busy: mergedPosts.filter((p) => !p.isAvailable && p.active).length,
          inactive: mergedPosts.filter((p) => !p.active).length,
        }
      : calculateStatsFromMap(station?.chargingPostsAvailable);

  // Debug logging
  useEffect(() => {
    if (station) {
      console.log("🏢 [StationModal] Station data:", {
        id: station.id,
        name: station.name,
        chargingPostsAvailable: station.chargingPostsAvailable,
        totalSlots: station.totalSlots,
        availableSlots: station.availableSlots,
        chargingSessionIds: station.chargingSessionIds,
        postsLoaded: posts.length,
        mergedPostsCount: mergedPosts.length,
        displayStats,
      });
    }
  }, [station, posts, mergedPosts, displayStats]);

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
          } else if (
            result &&
            typeof result === "object" &&
            !Array.isArray(result)
          ) {
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

  // Chỉ cần update hàm handleBookCharger trong StationModal.jsx

  const handleBookCharger = async (postId) => {
    try {
      // mark this specific post as processing so only its button shows loading
      setBookingProcessingId(postId);
      if (!currentUser) {
        setBookingProcessingId(null);
        alert("Vui lòng đăng nhập trước khi đặt chỗ.");
        return;
      }

      if (!selectedCar) {
        alert("Bạn chưa có xe. Vui lòng thêm xe để đặt chỗ.");
        return;
      }

      const payload = {
        user: currentUser.id || currentUser.userID,
        chargingPost: postId,
        car: selectedCar,
      };

      // ✅ createBooking sẽ tự động lưu status vào localStorage
      const res = await createBookingApi(payload);

      console.log("📦 [StationModal] Booking response:", res);
      console.log("   - status:", res?.status);
      console.log("   - rank:", res?.rank);
      console.log("   - idAction:", res?.idAction);

      if (res?.success || res?.status) {
        // ✅ Kiểm tra status từ response
        const status = res.status?.toLowerCase();

        if (status === "waiting") {
          // ✅ Lưu thông tin waiting vào localStorage
          if (res.idAction) {
            console.log("💾 [StationModal] Saving waiting info:");
            localStorage.setItem("waitingListId", res.idAction); // idAction = waitingListId
            localStorage.setItem("bookingStatus", "waiting");

            // Vẫn lưu rank nếu có (để hiển thị ngay)
            if (res.rank !== undefined && res.rank !== null && res.rank > 0) {
              localStorage.setItem("initialQueueRank", res.rank.toString());
            }

            localStorage.setItem("queuePostId", postId);
            console.log("✅ [StationModal] Saved to localStorage:");
            console.log(
              "   - waitingListId:",
              localStorage.getItem("waitingListId")
            );
            console.log(
              "   - bookingStatus:",
              localStorage.getItem("bookingStatus")
            );
            console.log(
              "   - initialQueueRank:",
              localStorage.getItem("initialQueueRank")
            );
          } else {
            console.warn("⚠️ [StationModal] No idAction in response:", res);
          }

          alert(`Trụ ${postId} đang đầy. Bạn đã được thêm vào danh sách chờ.`);
          onClose();
          navigate("/app/waiting");
        } else if (status === "booking") {
          // ✅ Lưu thông tin booking vào localStorage
          if (res.idAction) {
            console.log("💾 [StationModal] Saving booking info:");
            localStorage.setItem("bookingId", res.idAction); // idAction = bookingId
            localStorage.setItem("bookingStatus", "booking");
            console.log("✅ [StationModal] Saved to localStorage:");
            console.log("   - bookingId:", localStorage.getItem("bookingId"));
            console.log(
              "   - bookingStatus:",
              localStorage.getItem("bookingStatus")
            );
          }

          alert(`Đặt chỗ thành công cho trụ ${postId}!`);
          onClose();
          navigate("/app/booking");
        } else {
          alert(`Đặt chỗ thành công!`);
          onClose();
          navigate("/app/booking");
        }
      } else {
        const msg = res?.error || "Không thành công";
        alert(`Đặt chỗ thất bại: ${msg}`);
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Lỗi khi đặt chỗ, vui lòng thử lại sau.");
    } finally {
      // clear per-post processing flag
      setBookingProcessingId(null);
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

        {/* ⭐ NEW: Station Status Badge */}
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

          {/* ⭐ NEW: Show coordinates for debugging/admin */}
          {station.lat && station.lng && (
            <div className="station-coordinates">
              📍 {station.lat.toFixed(6)}, {station.lng.toFixed(6)}
            </div>
          )}
        </div>

        <div className="station-info">
          {/* Địa chỉ - Có từ API */}
          {station.address && (
            <div className="station-info__item">
              <IoLocationOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>{station.address}</span>
            </div>
          )}

          {/* Manager - Có từ API */}
          {station.userManagerName && station.userManagerName !== "N/A" && (
            <div className="station-info__item">
              <IoPeopleOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>Quản lý: {station.userManagerName}</span>
            </div>
          )}

          {/* Active Sessions - Có từ API */}
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

          {/* Distance - Chỉ có từ /available API */}
          {station.distance && station.distance !== "N/A" && (
            <div className="station-info__item">
              <IoLocationOutline
                className="station-info__icon"
                style={{ fontSize: "24px", color: "#10b981" }}
              />
              <span>Khoảng cách: {station.distance}</span>
            </div>
          )}

          {/* Established Time - Có từ API */}
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
        </div>

        <div className="station-details">
          {/* ⭐ Statistics - Always show from displayStats */}
          <div className="station-details__section">
            <div className="station-details__section-title">
              {posts.length > 0 ? "Thông tin chi tiết" : "Tổng quan trạm sạc"}
            </div>
            <div className="statistics-grid">
              <div className="statistics-item statistics-item--available">
                <div className="statistics-number statistics-number--available">
                  {displayStats.available}
                </div>
                <div className="statistics-label statistics-number--available">
                  {posts.length > 0 ? "Sẵn sàng" : "Trụ trống"}
                </div>
              </div>
              <div className="statistics-item statistics-item--busy">
                <div className="statistics-number statistics-number--busy">
                  {displayStats.busy}
                </div>
                <div className="statistics-label statistics-number--busy">
                  {posts.length > 0 ? "Đang bận" : "Đang sử dụng"}
                </div>
              </div>

              {/* Only show inactive if we have detailed posts data */}
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

              <div className="statistics-item statistics-item--total">
                <div className="statistics-number statistics-number--total">
                  {displayStats.total}
                </div>
                <div className="statistics-label statistics-number--total">
                  Tổng cộng
                </div>
              </div>

              {/* Show active sessions if available */}
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
            {mergedPosts.length > 0 ? (
              mergedPosts.map((post) => (
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
              <div className="charger-empty-state">
                <div>
                  <IoPowerOutline className="charger-empty-state__icon charger-empty-state__icon--loading" />
                </div>
                <div>Đang tải danh sách trụ sạc...</div>
              </div>
            ) : station.chargingPostsAvailable &&
              Object.keys(station.chargingPostsAvailable).length > 0 ? (
              // ⭐ Render posts from chargingPostsAvailable map
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
                {(() => {
                  const isGeneralProcessing =
                    bookingLoading && bookingProcessingId === "general";
                  return (
                    <Button
                      variant={
                        station.status === "available" ? "success" : "secondary"
                      }
                      disabled={
                        station.status !== "available" ||
                        !selectedCar ||
                        isGeneralProcessing
                      }
                      onClick={() => handleBookCharger("general")}
                      className="charger-empty-state__btn"
                    >
                      {isGeneralProcessing
                        ? "Đang xử lý..."
                        : station.status === "available"
                        ? "Đặt chỗ"
                        : station.status === "maintenance"
                        ? "Bảo trì"
                        : "Đầy chỗ"}
                    </Button>
                  );
                })()}
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

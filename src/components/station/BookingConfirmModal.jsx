import React from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCarOutline,
  IoPowerOutline,
  IoFlashOutline,
  IoCardOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoLocationOutline,
} from "react-icons/io5";
import "../../assets/styles/BookingConfirmModal.css";
import { useRole } from "../../hooks/useAuth";
import useBookingTime from "../../hooks/useBookingTime";

const BookingConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  post,
  station,
  selectedCar,
  userCars,
  isProcessing,
}) => {
  // Lấy maxWaitingTime từ localStorage (nếu có) — Booking page / WebSocket có thể lưu giá trị này
  const getMaxWaitingTimeFromStorage = () => {
    try {
      const raw = localStorage.getItem("maxWaitingTime");
      if (!raw) return null;

      // Nếu là số lưu dưới dạng string "30" → chuyển về number
      const num = Number(raw);
      if (!Number.isNaN(num) && raw.trim() !== "") return num;

      // Ngược lại trả về string (ISO datetime)
      return raw;
    } catch (error) {
      return null;
    }
  };

  const calculateWaitingMinutes = (maxWaitingTimeValue) => {
    if (!maxWaitingTimeValue) return null;

    try {
      // Case 1: là số phút
      if (typeof maxWaitingTimeValue === "number") return maxWaitingTimeValue;

      // Case 2: là ISO datetime string -> tính diff so với thời điểm hiện tại
      if (typeof maxWaitingTimeValue === "string") {
        const endTime = new Date(maxWaitingTimeValue);
        const now = new Date();
        if (isNaN(endTime.getTime())) return null;
        const diffMs = endTime - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? diffMinutes : 0;
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  // Prefer value from API if available, otherwise fallback to localStorage
  const { userId } = useRole();

  const storedMaxWaiting = getMaxWaitingTimeFromStorage();

  // Use the reusable hook to fetch bookingTime
  const {
    raw: bookingRaw,
    minutes: bookingMinutes,
    loading: bookingLoading,
    error: bookingError,
  } = useBookingTime(userId);

  const computedWaitingMinutes =
    bookingMinutes !== null && bookingMinutes !== undefined
      ? bookingMinutes
      : calculateWaitingMinutes(storedMaxWaiting);
  // Tìm thông tin xe được chọn
  const car = userCars.find(
    (c) => (c.carID || c.carId || c.id) === selectedCar
  );

  const carName = car
    ? `${car.make || car.brand || ""} ${car.model || ""} ${
        car.year || ""
      }`.trim() || "Xe của bạn"
    : "Chưa chọn xe";

  // Debug log
  React.useEffect(() => {
    if (isOpen) {
      console.log("🚀 BookingConfirmModal opened:", { isOpen, post, station });
    }
  }, [isOpen, post, station]);

  if (!isOpen) return null;

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      backdrop={isProcessing ? "static" : true}
      keyboard={!isProcessing}
      animation={false}
      dialogClassName="booking-confirm-modal"
      contentClassName="booking-confirm-content"
      backdropClassName="booking-confirm-backdrop"
      enforceFocus={false}
      container={document.body}
      style={{ display: "flex" }}
    >
      {/* Header */}
      {/* Không hiển thị nút đóng mặc định để tránh xuất hiện không mong muốn */}
      <Modal.Header closeButton={false} className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-3 w-100">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IoCheckmarkCircle style={{ fontSize: "28px", color: "white" }} />
          </div>
          <div>
            <h5 className="mb-1 fw-semibold">Xác nhận đặt chỗ</h5>
            <small className="text-muted">Vui lòng kiểm tra thông tin</small>
          </div>
          {/* Thông tin thời gian ước tính */}
          <div className="time-info">
            <IoTimeOutline className="me-2" />
            <span className="text-muted small">
              {post && post.isAvailable
                ? // Nếu có giá trị maxWaitingTime từ hệ thống thì dùng, ngược lại fallback 15 phút
                  computedWaitingMinutes !== null &&
                  computedWaitingMinutes !== undefined
                  ? `Bạn có ${computedWaitingMinutes} phút để đến trạm sau khi đặt chỗ`
                  : "Bạn có 15 phút để đến trạm sau khi đặt chỗ"
                : "Thời gian chờ phụ thuộc vào người dùng trước bạn"}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Thông tin trạm sạc */}
        <div className="info-card mb-3">
          <div className="d-flex align-items-start gap-2">
            <IoLocationOutline className="info-icon text-success mt-1" />
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-semibold">
                {station?.name || "Trạm sạc"}
              </h6>
              {station?.address && (
                <p className="mb-0 text-muted small">{station.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin trụ sạc */}
        {post && (
          <div className="info-card info-card-charger mb-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <IoPowerOutline className="info-icon text-success" />
                <h6 className="mb-0 fw-semibold">Trụ sạc #{post.id}</h6>
              </div>
              <Badge
                bg={post.isAvailable ? "success" : "warning"}
                className="px-3 py-2"
              >
                {post.isAvailable ? "Sẵn sàng" : "Đang bận"}
              </Badge>
            </div>

            <div className="charger-details">
              {post.powerDisplay && (
                <div className="detail-item">
                  <IoFlashOutline className="detail-icon" />
                  <span>
                    Công suất: <strong>{post.powerDisplay}</strong>
                  </span>
                </div>
              )}
              {post.feeDisplay && (
                <div className="detail-item">
                  <IoCardOutline className="detail-icon" />
                  <span>
                    Giá: <strong>{post.feeDisplay}</strong>
                  </span>
                </div>
              )}
              {post.supportedTypes && post.supportedTypes.length > 0 && (
                <div className="detail-item">
                  <IoSpeedometerOutline className="detail-icon" />
                  <span>
                    Loại: <strong>{post.supportedTypes.join(", ")}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thông tin xe */}
        <div className="info-card info-card-car mb-3">
          <div className="d-flex align-items-start gap-2">
            <IoCarOutline className="info-icon text-primary mt-1" />
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-semibold">Xe của bạn</h6>
              <p className="mb-0">{carName}</p>
              {car?.licensePlate && (
                <p className="mb-0 text-muted small mt-1">
                  Biển số: {car.licensePlate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cảnh báo nếu trụ đang bận */}
        {post && !post.isAvailable && (
          <div className="alert alert-warning d-flex align-items-start gap-2 mb-3">
            <IoAlertCircle
              className="flex-shrink-0 mt-1"
              style={{ fontSize: "20px" }}
            />
            <div>
              <p className="mb-1 fw-semibold">Trụ đang bận</p>
              <p className="mb-0 small">
                Bạn sẽ được thêm vào danh sách chờ và được thông báo khi có chỗ
                trống.
              </p>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={isProcessing}
          className="px-4"
        >
          Hủy
        </Button>
        <Button
          variant="success"
          onClick={onConfirm}
          disabled={isProcessing}
          className="px-4"
        >
          {isProcessing
            ? "Đang xử lý..."
            : post && post.isAvailable
            ? "Xác nhận đặt chỗ"
            : "Vào hàng chờ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingConfirmModal;

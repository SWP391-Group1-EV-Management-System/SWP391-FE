import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import BookingActions from "../components/energy/BookingActions";
import { SessionInfo } from "../components/energy/SessionInfo";
import { WaitingTime } from "../components/energy/WaitingTime";
import useBooking from "../hooks/useBooking";
import { useAuth } from "../hooks/useAuth";
import {
  CalendarOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  console.log("👤 [BookingPage] Current user:", user);
  console.log("⏳ [BookingPage] Auth loading:", authLoading);

  // State quản lý booking data
  const [bookingData, setBookingData] = useState(null);
  const [statusConfig, setStatusConfig] = useState(null);

  // ✅ Sử dụng useBooking hook
  const {
    loading: bookingLoading,
    error: bookingError,
    bookings, // ✅ Lấy bookings (danh sách) thay vì booking (đơn lẻ)
    fetchBookingsByUser,
    completeBooking,
    cancelBooking,
  } = useBooking();

  // ✅ Fetch booking data khi component mount
  useEffect(() => {
    if (user?.id) {
      console.log("🔍 [BookingPage] Fetching bookings for userId:", user.id);
      fetchBookingsByUser(user.id);
    }
  }, [user?.id, fetchBookingsByUser]);

  // ✅ Set booking data khi có bookings
  useEffect(() => {
    console.log("📦 [BookingPage] Bookings data:", bookings);

    if (bookings && bookings.length > 0) {
      // ✅ Lấy booking đầu tiên hoặc booking với status 'booking'/'waiting'
      const activeBooking =
        bookings.find(
          (b) =>
            b.status?.toLowerCase() === "booking" ||
            b.status?.toLowerCase() === "waiting"
        ) || bookings[0];

      console.log("✅ [BookingPage] Active booking:", activeBooking);
      setBookingData(activeBooking);

      // Determine status config based on booking status
      const status = activeBooking.status?.toLowerCase();
      let config = null;

      if (status === "completed") {
        config = {
          color: "success",
          icon: "✓",
          text: "Hoàn thành",
          isCompleted: true,
          isCharging: false,
        };
      } else if (status === "cancelled") {
        config = {
          color: "error",
          icon: "✕",
          text: "Đã hủy",
          isCompleted: false,
          isCharging: false,
        };
      } else if (status === "booking" || status === "active") {
        config = {
          color: "processing",
          icon: "⚡",
          text: "Đang hoạt động",
          isCompleted: false,
          isCharging: true,
        };
      } else if (status === "waiting") {
        config = {
          color: "warning",
          icon: "⏳",
          text: "Đang chờ",
          isCompleted: false,
          isCharging: false,
        };
      }

      setStatusConfig(config);
    } else {
      setBookingData(null);
      setStatusConfig(null);
    }
  }, [bookings]);

  // Listen for booking events
  useEffect(() => {
    const handleBookingCreated = (e) => {
      console.log("bookingCreated event received:", e?.detail);
      if (user?.id) {
        fetchBookingsByUser(user.id);
      }
    };

    window.addEventListener("bookingCreated", handleBookingCreated);
    return () =>
      window.removeEventListener("bookingCreated", handleBookingCreated);
  }, [user?.id, fetchBookingsByUser]);

  // ✅ Handler hủy booking
  const handleCancelBooking = async () => {
    if (!bookingData?.bookingId) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin booking.",
      });
      return;
    }

    try {
      await cancelBooking(bookingData.bookingId);

      // ✅ Update local state immediately
      const updatedBookingData = {
        ...bookingData,
        status: "cancelled",
      };
      setBookingData(updatedBookingData);

      // ✅ Update status config
      setStatusConfig({
        color: "error",
        icon: "✕",
        text: "Đã hủy",
        isCompleted: false,
        isCharging: false,
        isCancelled: true,
      });

      notification.success({
        message: "Thành công",
        description: "Hủy booking thành công.",
      });
    } catch (error) {
      console.error("❌ Error canceling booking:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể hủy booking. Vui lòng thử lại.",
      });
    }
  };

  // ==================== LOADING STATE ====================
  if (bookingLoading || authLoading) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" spinning={true} tip="Đang tải thông tin booking...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== FORBIDDEN STATE (403) ====================
  const isForbidden =
    !user ||
    (bookingData &&
      user.id !== bookingData.userId &&
      user.role !== "ADMIN" &&
      user.role !== "MANAGER");

  if (isForbidden) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <LockOutlined
            style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }}
          />
          <Alert
            message="Không có quyền truy cập"
            description={
              <div>
                <p>Bạn không có quyền truy cập booking này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Booking này có thể thuộc về người dùng khác hoặc bạn không có
                  quyền xem.
                </p>
              </div>
            }
            type="error"
            showIcon={false}
            style={{ marginBottom: "20px" }}
          />
          <Space>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => {
                navigate("/app/home");
              }}
            >
              Về trang chủ
            </Button>
            <Button
              onClick={() => {
                if (user?.id) {
                  fetchBookingsByUser(user.id);
                }
              }}
            >
              Thử lại
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (bookingError) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Lỗi tải dữ liệu"
          description={
            <div>
              <p>{bookingError.message || "Đã có lỗi xảy ra"}</p>
            </div>
          }
          type="error"
          showIcon
          closable
          action={
            <Button
              size="small"
              onClick={() => {
                if (user?.id) {
                  fetchBookingsByUser(user.id);
                }
              }}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // ==================== NO BOOKING STATE ====================
  if (!bookingData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Không có booking"
          description="Hiện tại không có booking nào đang hoạt động"
          type="info"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={() => navigate("/app/map")}>
                Tìm trạm sạc
              </Button>
              <Button
                size="small"
                onClick={() => {
                  if (user?.id) {
                    fetchBookingsByUser(user.id);
                  }
                }}
              >
                Tải lại
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // ==================== MAIN CONTENT ====================
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <PageHeader
            title={bookingData.post?.station?.stationName || "Booking"}
            icon={<CalendarOutlined />}
            subtitle={bookingData.post?.station?.address || ""}
            statusTag={
              statusConfig
                ? {
                    color: statusConfig.color,
                    icon: statusConfig.icon,
                    text: statusConfig.text,
                  }
                : null
            }
          />

          {/* Row 1: Session Info & Waiting Time */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <SessionInfo sessionData={bookingData} />
            </Col>

            <Col xs={24} lg={12}>
              <WaitingTime sessionData={bookingData} />
            </Col>
          </Row>

          {/* Row 2: Technical Details & Booking Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={bookingData} />
            </Col>

            <Col xs={24} lg={12}>
              <BookingActions
                sessionData={bookingData}
                onCancel={handleCancelBooking}
                isCancelled={bookingData?.status?.toLowerCase() === "cancelled"}
              />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default BookingPage;

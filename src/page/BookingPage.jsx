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
import { getBookingById } from "../services/bookingService";
import { CalendarOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  console.log("👤 [BookingPage] Current user:", user);
  console.log("⏳ [BookingPage] Auth loading:", authLoading);

  // State quản lý booking data
  const [bookingData, setBookingData] = useState(null);
  const [statusConfig, setStatusConfig] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ✅ Sử dụng useBooking hook (chỉ cho cancel function)
  const { cancelBooking } = useBooking();

  // ✅ Fetch CHI TIẾT booking từ localStorage (giống WaitingListPage)
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const bookingId = localStorage.getItem("bookingId");

        if (bookingId) {
          console.log("� [BookingPage] Fetching booking detail:", bookingId);
          setDetailLoading(true);

          const detail = await getBookingById(bookingId);
          console.log("✅ [BookingPage] Booking detail:", detail);

          // Map BookingResponseDTO to display format
          const mappedData = {
            bookingId: detail.bookingId,
            stationName: detail.stationName || "Trạm sạc",
            chargingPostId: detail.chargingPostId,
            status: detail.status,
            maxWaitingTime: detail.maxWaitingTime,
            arrivalTime: detail.arrivalTime,
            createdAt: detail.createdAt,
            userId: detail.userId,
            carId: detail.carId,
          };

          setBookingData(mappedData);

          // Determine status config based on booking status
          const status = detail.status?.toLowerCase();
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
          setDetailLoading(false);
        } else {
          console.log("⚠️ [BookingPage] No bookingId in localStorage");
          setBookingData(null);
          setStatusConfig(null);
        }
      } catch (error) {
        console.error("❌ [BookingPage] Error fetching detail:", error);
        setDetailLoading(false);
      }
    };

    if (user?.id) {
      fetchDetail();
    }
  }, [user?.id]);
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
      // ✅ LƯU thời gian countdown hiện tại TRƯỚC KHI hủy
      const countdownKey = `countdown_${bookingData.bookingId}`;
      const frozenKey = `countdown_frozen_${bookingData.bookingId}`;

      try {
        const savedEndTime = localStorage.getItem(countdownKey);
        if (savedEndTime) {
          const endTime = new Date(savedEndTime);
          const now = new Date();
          const remainingMs = endTime - now;

          if (remainingMs > 0) {
            const remainingSeconds = Math.floor(remainingMs / 1000);
            const hours = Math.floor(remainingSeconds / 3600);
            const mins = Math.floor((remainingSeconds % 3600) / 60);
            const secs = remainingSeconds % 60;
            const frozenTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
              secs
            ).padStart(2, "0")}`;

            // ✅ LƯU thời gian đóng băng
            localStorage.setItem(frozenKey, frozenTime);
            console.log("🧊 [BookingPage] Frozen countdown time:", frozenTime);
          }
        }
      } catch (err) {
        console.error("❌ [BookingPage] Error freezing countdown:", err);
      }

      await cancelBooking(bookingData.bookingId);

      // ✅ Xóa TẤT CẢ localStorage (trừ frozen time)
      try {
        // Xóa booking info
        localStorage.removeItem("bookingId");
        localStorage.removeItem("bookingStatus");
        localStorage.removeItem("maxWaitingTime");

        // ✅ XÓA COUNTDOWN endTime (để dừng countdown)
        localStorage.removeItem(countdownKey);

        console.log("🗑️ [BookingPage] Cleared all localStorage after cancel (frozen time preserved)");
      } catch (error) {
        console.error("❌ [BookingPage] Error clearing localStorage:", error);
      }

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
  if (detailLoading || authLoading) {
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
    !user || (bookingData && user.id !== bookingData.userId && user.role !== "ADMIN" && user.role !== "MANAGER");

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
          <LockOutlined style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }} />
          <Alert
            message="Không có quyền truy cập"
            description={
              <div>
                <p>Bạn không có quyền truy cập booking này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Booking này có thể thuộc về người dùng khác hoặc bạn không có quyền xem.
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
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </Space>
        </div>
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
              <Button size="small" onClick={() => window.location.reload()}>
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

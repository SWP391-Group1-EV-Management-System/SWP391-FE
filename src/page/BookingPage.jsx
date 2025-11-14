import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import { SessionInfo } from "../components/energy/SessionInfo";
import { WaitingTime } from "../components/energy/WaitingTime";
import useBooking from "../hooks/useBooking";
import { useAuth } from "../hooks/useAuth";
import { getBookingById } from "../services/bookingService";
import chargingStationService from "../services/chargingStationService";
import { CalendarOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";

const BookingPage = () => {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [bookingData, setBookingData] = useState(null);
  const [statusConfig, setStatusConfig] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chargingPostData, setChargingPostData] = useState(null);

  // ===== CUSTOM HOOKS =====
  const { cancelBooking } = useBooking();

  // ===== EFFECT: Lấy chi tiết booking từ localStorage =====
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const bookingId = localStorage.getItem("bookingId");

        if (bookingId) {
          setDetailLoading(true);

          const detail = await getBookingById(bookingId);

          // Map BookingResponseDTO sang format hiển thị
          const mappedData = {
            bookingId: detail.bookingId,
            stationName: detail.stationName || "Trạm sạc",
            chargingPostId: detail.chargingPostId,
            chargingStationId: detail.chargingStationId,
            status: detail.status,
            maxWaitingTime: detail.maxWaitingTime,
            arrivalTime: detail.arrivalTime,
            createdAt: detail.createdAt,
            userId: detail.userId,
            carId: detail.carId,
          };

          setBookingData(mappedData);

          // Lấy thông tin chi tiết charging post
          if (detail.chargingPostId) {
            try {
              const postDetail = await chargingStationService.getPostById(detail.chargingPostId);
              setChargingPostData(postDetail);
            } catch (postError) {
              // Không hiển thị lỗi nếu không lấy được thông tin charging post
            }
          }

          // Xác định cấu hình trạng thái dựa trên booking status
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
          setBookingData(null);
          setStatusConfig(null);
        }
      } catch (error) {
        setDetailLoading(false);
      }
    };

    if (user?.id) {
      fetchDetail();
    }
  }, [user?.id]);

  // ===== FUNCTION: Hủy booking =====
  const handleCancelBooking = async () => {
    if (!bookingData?.bookingId) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin booking.",
      });
      return;
    }

    try {
      // Lưu thời gian countdown hiện tại trước khi hủy
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

            // Lưu thời gian đóng băng
            localStorage.setItem(frozenKey, frozenTime);
          }
        }
      } catch (err) {
        // Không xử lý lỗi nếu không thể đóng băng countdown
      }

      await cancelBooking(bookingData.bookingId);

      // Xóa tất cả localStorage (trừ frozen time)
      try {
        localStorage.removeItem("bookingId");
        localStorage.removeItem("bookingStatus");
        localStorage.removeItem("maxWaitingTime");
        localStorage.removeItem(countdownKey);
      } catch (error) {
        // Không xử lý lỗi nếu không thể xóa localStorage
      }

      // Cập nhật state local ngay lập tức
      const updatedBookingData = {
        ...bookingData,
        status: "cancelled",
      };
      setBookingData(updatedBookingData);

      // Cập nhật cấu hình trạng thái
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
      notification.error({
        message: "Lỗi",
        description: "Không thể hủy booking. Vui lòng thử lại.",
      });
    }
  };

  // ===== RENDER: Trạng thái đang tải =====
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

  // ===== RENDER: Trạng thái không có quyền truy cập (403) =====
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
        {/* Thông báo không có quyền truy cập */}
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
          {/* Các nút điều hướng */}
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

  // ===== RENDER: Trạng thái không có booking =====
  if (!bookingData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {/* Thông báo không có booking */}
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

  // ===== RENDER: Nội dung chính =====
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
          {/* Header trang */}
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

          {/* Hàng 1: Thông tin phiên và thời gian chờ */}
          <Row gutter={[16, 16]}>
            {/* Thông tin phiên */}
            <Col xs={24} lg={12}>
              <SessionInfo sessionData={bookingData} />
            </Col>

            {/* Thời gian chờ */}
            <Col xs={24} lg={12}>
              <WaitingTime
                sessionData={bookingData}
                onCancel={handleCancelBooking}
                isCancelled={bookingData?.status?.toLowerCase() === "cancelled"}
              />
            </Col>
          </Row>

          {/* Hàng 2: Chi tiết kỹ thuật */}
          <Row gutter={16}>
            <Col xs={24} lg={24}>
              <TechnicalDetails sessionData={bookingData} chargingPostData={chargingPostData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default BookingPage;

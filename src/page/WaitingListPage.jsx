// Trang hàng đợi - hiển thị vị trí và thời gian chờ trong hàng đợi sạc
import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification, Modal } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import { SessionInfo } from "../components/energy/SessionInfo";
import { WaitingTime } from "../components/energy/WaitingTime";
import WaitingQueueInfo from "../components/energy/WaitingQueueInfo";
import useWaitingList from "../hooks/useWaitingList";
import useBooking from "../hooks/useBooking";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { ClockCircleOutlined, LockOutlined, HomeOutlined, WifiOutlined } from "@ant-design/icons";
import { getWaitingListById } from "../services/waitingListService";
import { getBookingById } from "../services/bookingService";
import chargingStationService from "../services/chargingStationService";
import { setDriverStatus } from "../utils/statusUtils";

const WaitingListPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [waitingData, setWaitingData] = useState(null);
  const [statusConfig, setStatusConfig] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chargingPostData, setChargingPostData] = useState(null);
  const [hasEarlyChargingOfferPending, setHasEarlyChargingOfferPending] = useState(false);

  // Khởi tạo vị trí trong hàng đợi từ localStorage
  const [queueRank, setQueueRank] = useState(() => {
    try {
      const savedRank = localStorage.getItem("initialQueueRank");
      if (savedRank) {
        return parseInt(savedRank);
      }
    } catch (error) {
      console.error("Error reading initialQueueRank:", error);
    }
    return null;
  });

  // Khởi tạo ID trụ sạc từ localStorage
  const [chargingPostId, setChargingPostId] = useState(() => {
    try {
      const savedPostId = localStorage.getItem("queuePostId");
      if (savedPostId) {
        return savedPostId;
      }
    } catch (error) {
      console.error("Error reading queuePostId:", error);
    }
    return null;
  });

  // Khởi tạo max waiting time từ localStorage
  const [localMaxWaitingTime, setLocalMaxWaitingTime] = useState(() => {
    try {
      // ✅ KHÔNG đọc từ localStorage vì có thể là của user khác
      // Sẽ lấy từ API detail thay thế
      return null;
    } catch (error) {
      console.error("Error reading maxWaitingTime:", error);
    }
    return null;
  });

  const { cancelWaitingList, acceptEarlyChargingOffer, declineEarlyChargingOffer } = useWaitingList();
  const { fetchBookingsByUser } = useBooking();

  // Kết nối WebSocket để nhận cập nhật realtime
  const {
    connected,
    messages,
    position,
    maxWaitingTime: wsMaxWaitingTime,
    bookingConfirmed,
    earlyChargingOffer,
  } = useWebSocket(user?.id, chargingPostId);

  // Tải chi tiết waiting/booking từ API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const bookingStatus = localStorage.getItem("bookingStatus");

        if (bookingStatus === "waiting") {
          const waitingListId = localStorage.getItem("waitingListId");
          if (waitingListId) {
            setDetailLoading(true);
            const detail = await getWaitingListById(waitingListId);

            const mappedData = {
              waitingListId: detail.waitingListId,
              stationName: detail.stationName || "Trạm sạc",
              chargingPostId: detail.chargingPostId,
              chargingStationId: detail.chargingStationId,
              status: detail.status,
              expectedWaitingTime: detail.expectedWaitingTime,
              createdAt: detail.createdAt,
              outedAt: detail.outedAt,
              userId: detail.userId,
              carId: detail.carId,
              // ✅ CHỈ dùng expectedWaitingTime từ backend, KHÔNG dùng localStorage
              maxWaitingTime: detail.expectedWaitingTime,
            };

            setWaitingData(mappedData);
            setChargingPostId(detail.chargingPostId);

            // Lấy thông tin chi tiết charging post
            if (detail.chargingPostId) {
              try {
                const postDetail = await chargingStationService.getPostById(detail.chargingPostId);
                setChargingPostData(postDetail);
              } catch (postError) {
                console.error("Error fetching charging post:", postError);
              }
            }

            setStatusConfig({
              color: "warning",
              icon: "⏳",
              text: "Đang chờ",
              isCompleted: false,
              isCharging: false,
            });

            setDetailLoading(false);
          }
        } else if (bookingStatus === "booking") {
          const bookingId = localStorage.getItem("bookingId");
          if (bookingId) {
            setDetailLoading(true);
            const detail = await getBookingById(bookingId);

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

            setWaitingData(mappedData);
            setChargingPostId(detail.chargingPostId);

            // Lấy thông tin chi tiết charging post
            if (detail.chargingPostId) {
              try {
                const postDetail = await chargingStationService.getPostById(detail.chargingPostId);
                setChargingPostData(postDetail);
              } catch (postError) {
                console.error("Error fetching charging post:", postError);
              }
            }

            setStatusConfig({
              color: "success",
              icon: "✅",
              text: "Đã đặt",
              isCompleted: false,
              isCharging: false,
            });

            setDetailLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
        setDetailLoading(false);
      }
    };

    if (user?.id) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Đọc localStorage khi component mount
  useEffect(() => {
    try {
      const savedRank = localStorage.getItem("initialQueueRank");
      const savedPostId = localStorage.getItem("queuePostId");

      if (savedRank && savedPostId) {
        const initialRank = parseInt(savedRank);
        setQueueRank(initialRank);
        setChargingPostId(savedPostId);
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  }, []);

  // Cập nhật vị trí trong hàng đợi từ WebSocket
  useEffect(() => {
    if (position !== null && position !== undefined) {
      setQueueRank((oldRank) => {
        // Hiển thị thông báo khi vị trí thay đổi
        if (oldRank !== null && position !== oldRank) {
          notification.info({
            message: "Cập nhật vị trí",
            description: `Vị trí của bạn trong hàng đợi: #${position}`,
            placement: "topRight",
            duration: 3,
          });
        }

        // Cập nhật localStorage
        try {
          if (chargingPostId) {
            localStorage.setItem("initialQueueRank", position.toString());
            localStorage.setItem("queuePostId", chargingPostId);
          }
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }

        return position;
      });
    }
  }, [position, chargingPostId]);

  // Cập nhật thời gian chờ từ WebSocket (chỉ cho vị trí #1)
  useEffect(() => {
    // ✅ CHỈ CẬP NHẬT NẾU USER ĐANG Ở VỊ TRÍ #1 TRONG HÀNG CHỜ
    // User thứ 2 trở đi KHÔNG được cập nhật thời gian chờ từ WebSocket
    if (wsMaxWaitingTime && queueRank === 1) {
      console.log("⏰ Updating maxWaitingTime for position #1");
      setLocalMaxWaitingTime(wsMaxWaitingTime);

      setWaitingData((oldData) => {
        if (oldData) {
          return {
            ...oldData,
            maxWaitingTime: wsMaxWaitingTime,
            expectedWaitingTime: wsMaxWaitingTime,
          };
        }
        return oldData;
      });

      notification.info({
        message: "Cập nhật thời gian chờ",
        description: `Thời gian chờ tối đa: ${wsMaxWaitingTime}`,
        placement: "topRight",
        duration: 3,
      });
    } else if (wsMaxWaitingTime && queueRank > 1) {
      console.log(
        `⚠️ [WaitingListPage] Ignoring maxWaitingTime update for position #${queueRank} (not first in queue)`
      );
    }
  }, [wsMaxWaitingTime, queueRank]);

  // Xử lý chuyển từ waiting sang booking
  useEffect(() => {
    if (bookingConfirmed) {
      try {
        localStorage.setItem("bookingId", bookingConfirmed.bookingId);
        localStorage.setItem("bookingStatus", "booking");
        localStorage.removeItem("waitingListId");
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");

        setDriverStatus("booking");
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }

      notification.success({
        message: "Chuyển sang Booking!",
        description: bookingConfirmed.message || "Bạn đã được chuyển vào booking. Đang chuyển trang...",
        placement: "topRight",
        duration: 3,
      });

      setTimeout(() => {
        navigate("/app/booking");
      }, 1500);
    }
  }, [bookingConfirmed, navigate]);

  // Xử lý đề nghị sạc sớm từ WebSocket
  useEffect(() => {
    if (earlyChargingOffer) {
      setHasEarlyChargingOfferPending(true);

      const minutesEarly = earlyChargingOffer.minutesEarly;

      // Parse thời gian dự kiến
      let expectedTime = "không xác định";
      try {
        const timeValue = earlyChargingOffer.expectedEndTime || earlyChargingOffer.expectedTime || wsMaxWaitingTime;

        if (timeValue) {
          const dateObj = new Date(timeValue);
          if (!isNaN(dateObj.getTime())) {
            expectedTime = dateObj.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }

      // Hiển thị modal xác nhận
      Modal.confirm({
        title: "🔋 Trạm sạc sẵn sàng sớm!",
        icon: null,
        width: 500,
        content: (
          <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
            <p style={{ marginBottom: "16px" }}>
              ⚡ <strong>Trạm sạc đã sẵn sàng sớm {minutesEarly} phút!</strong>
            </p>
            <p style={{ marginBottom: "16px" }}>Bạn có muốn sạc ngay không?</p>
            <div
              style={{
                padding: "12px",
                background: "#fff7e6",
                borderRadius: "8px",
                border: "1px solid #ffd666",
                marginTop: "16px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#ad6800" }}>
                ⏰ Nếu từ chối, bạn sẽ tự động vào booking lúc: <strong>{expectedTime}</strong>
              </p>
            </div>
          </div>
        ),
        okText: "✅ Sạc ngay",
        cancelText: "⏰ Chờ đến giờ",
        okButtonProps: {
          size: "large",
          style: { height: "48px", fontSize: "16px", fontWeight: 600 },
        },
        cancelButtonProps: {
          size: "large",
          style: { height: "48px", fontSize: "16px" },
        },
        onOk: async () => {
          setHasEarlyChargingOfferPending(false);
          try {
            await acceptEarlyChargingOffer(user.id, earlyChargingOffer.postId);
            notification.success({
              message: "Đã chuyển vào booking!",
              description: "Bạn đã được chuyển vào booking. Vui lòng đến trạm sạc ngay!",
              placement: "topRight",
              duration: 5,
            });
          } catch (error) {
            console.error("Error accepting early charging:", error);
            notification.error({
              message: "Lỗi",
              description: "Không thể chấp nhận đề nghị. Vui lòng thử lại.",
              placement: "topRight",
            });
          }
        },
        onCancel: async () => {
          setHasEarlyChargingOfferPending(false);
          try {
            await declineEarlyChargingOffer(user.id, earlyChargingOffer.postId);
            notification.info({
              message: "Đã từ chối",
              description: "Bạn sẽ được thông báo khi đến giờ dự kiến",
              placement: "topRight",
              duration: 5,
            });
          } catch (error) {
            notification.error({
              message: "Lỗi",
              description: "Không thể từ chối đề nghị. Vui lòng thử lại.",
              placement: "topRight",
            });
          }
        },
      });
    }
  }, [earlyChargingOffer, user?.id, wsMaxWaitingTime, acceptEarlyChargingOffer, declineEarlyChargingOffer]);

  // Polling: kiểm tra chuyển trạng thái waiting -> booking
  useEffect(() => {
    if (!user?.id || !waitingData?.waitingListId) {
      return;
    }

    // Bỏ qua polling nếu đang chờ người dùng xác nhận sạc sớm
    if (hasEarlyChargingOfferPending) {
      return;
    }

    const bookingStatus = localStorage.getItem("bookingStatus");
    if (bookingStatus !== "waiting") {
      return;
    }

    const checkStatusInterval = setInterval(async () => {
      try {
        // Kiểm tra waiting list còn tồn tại không
        try {
          const waitingDetail = await getWaitingListById(waitingData.waitingListId);

          if (!waitingDetail || waitingDetail.status === "cancelled") {
            const bookings = await fetchBookingsByUser(user.id);

            if (bookings && bookings.length > 0) {
              const activeBooking = bookings.find(
                (b) =>
                  (b.status === "booking" || b.status === "active") && b.chargingPostId === waitingData.chargingPostId
              );

              if (activeBooking) {
                clearInterval(checkStatusInterval);

                localStorage.setItem("bookingId", activeBooking.bookingId);
                localStorage.setItem("bookingStatus", "booking");
                localStorage.removeItem("waitingListId");
                localStorage.removeItem("initialQueueRank");
                localStorage.removeItem("queuePostId");

                notification.success({
                  message: "Chuyển sang Booking!",
                  description: "Bạn đã được chuyển vào booking. Đang chuyển trang...",
                  placement: "topRight",
                  duration: 3,
                });

                setTimeout(() => {
                  navigate("/app/booking");
                }, 1000);
                return;
              }
            }
          }
        } catch (waitingError) {
          // Nếu waiting list bị xóa (404), kiểm tra booking
          if (waitingError.response?.status === 404 || waitingError.message?.includes("404")) {
            const bookings = await fetchBookingsByUser(user.id);

            if (bookings && bookings.length > 0) {
              const activeBooking = bookings.find(
                (b) =>
                  (b.status === "booking" || b.status === "active") && b.chargingPostId === waitingData.chargingPostId
              );

              if (activeBooking) {
                clearInterval(checkStatusInterval);

                localStorage.setItem("bookingId", activeBooking.bookingId);
                localStorage.setItem("bookingStatus", "booking");
                localStorage.removeItem("waitingListId");
                localStorage.removeItem("initialQueueRank");
                localStorage.removeItem("queuePostId");

                notification.success({
                  message: "Chuyển sang Booking!",
                  description: "Bạn đã được chuyển vào booking. Đang chuyển trang...",
                  placement: "topRight",
                  duration: 3,
                });

                setTimeout(() => {
                  navigate("/app/booking");
                }, 1000);
                return;
              }
            }
          }
        }

        // Luôn kiểm tra booking mới
        const bookings = await fetchBookingsByUser(user.id);

        if (bookings && bookings.length > 0) {
          const activeBooking = bookings.find(
            (b) => (b.status === "booking" || b.status === "active") && b.chargingPostId === waitingData.chargingPostId
          );

          if (activeBooking) {
            clearInterval(checkStatusInterval);

            localStorage.setItem("bookingId", activeBooking.bookingId);
            localStorage.setItem("bookingStatus", "booking");
            localStorage.removeItem("waitingListId");
            localStorage.removeItem("initialQueueRank");
            localStorage.removeItem("queuePostId");

            notification.success({
              message: "Chuyển sang Booking!",
              description: "Bạn đã được chuyển vào booking. Đang chuyển trang...",
              placement: "topRight",
              duration: 3,
            });

            setTimeout(() => {
              navigate("/app/booking");
            }, 1000);
            return;
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 3000);

    return () => {
      clearInterval(checkStatusInterval);
    };
  }, [
    user?.id,
    waitingData?.waitingListId,
    waitingData?.chargingPostId,
    navigate,
    fetchBookingsByUser,
    hasEarlyChargingOfferPending,
  ]);

  // Hiển thị thông báo từ WebSocket
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      notification.info({
        message: "Thông báo hàng đợi",
        description: latestMessage.text,
        placement: "topRight",
        duration: 5,
      });
    }
  }, [messages]);

  // Xử lý hủy hàng đợi
  const handleCancelWaiting = async () => {
    if (!waitingData?.waitingListId) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin hàng đợi.",
      });
      return;
    }

    try {
      const waitingCountdownKey = `countdown_${waitingData.waitingListId}`;
      const bookingCountdownKey = `countdown_${waitingData.bookingId}`;
      const frozenWaitingKey = `countdown_frozen_${waitingData.waitingListId}`;
      const frozenBookingKey = `countdown_frozen_${waitingData.bookingId}`;

      // Lưu thời gian countdown hiện tại
      try {
        const savedWaitingEndTime = localStorage.getItem(waitingCountdownKey);
        if (savedWaitingEndTime) {
          const endTime = new Date(savedWaitingEndTime);
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

            localStorage.setItem(frozenWaitingKey, frozenTime);
          }
        }

        const savedBookingEndTime = localStorage.getItem(bookingCountdownKey);
        if (savedBookingEndTime) {
          const endTime = new Date(savedBookingEndTime);
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

            localStorage.setItem(frozenBookingKey, frozenTime);
          }
        }
      } catch (err) {
        console.error("Error freezing countdown:", err);
      }

      await cancelWaitingList(waitingData.waitingListId);

      // Xóa localStorage (trừ frozen time)
      try {
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");
        localStorage.removeItem("waitingListId");
        localStorage.removeItem("bookingId");
        localStorage.removeItem("bookingStatus");
        localStorage.removeItem("maxWaitingTime");

        if (waitingData.waitingListId) {
          localStorage.removeItem(waitingCountdownKey);
        }
        if (waitingData.bookingId) {
          localStorage.removeItem(bookingCountdownKey);
        }
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }

      // Cập nhật state
      const updatedWaitingData = {
        ...waitingData,
        status: "cancelled",
      };
      setWaitingData(updatedWaitingData);

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
        description: "Hủy hàng đợi thành công.",
      });
    } catch (error) {
      console.error("Error canceling waiting:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể hủy hàng đợi. Vui lòng thử lại.",
      });
    }
  };

  // Hiển thị các trạng thái: loading, forbidden, no data
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
        <Spin size="large" spinning={true} tip="Đang tải thông tin hàng đợi...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  const isForbidden =
    !user || (waitingData && user.id !== waitingData.userId && user.role !== "ADMIN" && user.role !== "MANAGER");

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
                <p>Bạn không có quyền truy cập hàng đợi này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Hàng đợi này có thể thuộc về người dùng khác hoặc bạn không có quyền xem.
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

  if (!waitingData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Không có hàng đợi"
          description="Hiện tại bạn không có trong hàng đợi nào"
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
          {/* Trạng thái kết nối WebSocket */}
          {waitingData && (
            <Alert
              message={
                <Space>
                  <WifiOutlined style={{ fontSize: "16px" }} />
                  <span>{connected ? "Kết nối thời gian thực đang hoạt động" : "Đang kết nối lại WebSocket..."}</span>
                </Space>
              }
              type={connected ? "success" : "warning"}
              showIcon={false}
              style={{ borderRadius: "8px" }}
            />
          )}

          {/* Header */}
          <PageHeader
            title={waitingData.post?.station?.stationName || "Hàng đợi"}
            icon={<ClockCircleOutlined />}
            subtitle={waitingData.post?.station?.address || ""}
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

          {/* Hàng 1: Thông tin phiên & Thời gian chờ */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <SessionInfo sessionData={waitingData} />
            </Col>

            <Col xs={24} lg={12}>
              <WaitingTime sessionData={waitingData} queueRank={queueRank} />
            </Col>
          </Row>

          {/* Hàng 2: Chi tiết kỹ thuật & Thông tin hàng đợi */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={waitingData} chargingPostData={chargingPostData} />
            </Col>

            <Col xs={24} lg={12}>
              <WaitingQueueInfo
                sessionData={waitingData}
                queueRank={queueRank}
                onCancel={handleCancelWaiting}
                isCancelled={waitingData?.status?.toLowerCase() === "cancelled"}
              />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default WaitingListPage;

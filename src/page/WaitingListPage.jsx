import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification } from "antd";
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
import {
  ClockCircleOutlined,
  LockOutlined,
  HomeOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { getWaitingListById } from "../services/waitingListService";
import { getBookingById } from "../services/bookingService";
import chargingStationService from "../services/chargingStationService";

const WaitingListPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  console.log("� [WaitingListPage] Component rendering...");
  console.log("�👤 [WaitingListPage] Current user:", user);
  console.log("👤 [WaitingListPage] User details:");
  console.log("   - user.id:", user?.id);
  console.log("   - user.userId:", user?.userId);
  console.log("   - user.username:", user?.username);
  console.log("   - user.email:", user?.email);
  console.log("   - user object keys:", user ? Object.keys(user) : "null");
  console.log("⏳ [WaitingListPage] Auth loading:", authLoading);

  // State quản lý waiting list data
  const [waitingData, setWaitingData] = useState(null);
  const [statusConfig, setStatusConfig] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chargingPostData, setChargingPostData] = useState(null); // ✅ Thêm state cho charging post details

  // ✅ ĐỌC LOCALSTORAGE NGAY TRONG useState INITIALIZER
  const [queueRank, setQueueRank] = useState(() => {
    try {
      const savedRank = localStorage.getItem("initialQueueRank");
      if (savedRank) {
        console.log(
          "💾 [WaitingListPage] Initial rank from localStorage:",
          savedRank
        );
        return parseInt(savedRank);
      }
    } catch (error) {
      console.error("❌ Error reading initialQueueRank:", error);
    }
    console.log("⚠️ [WaitingListPage] No initial rank in localStorage");
    return null;
  });

  const [chargingPostId, setChargingPostId] = useState(() => {
    try {
      const savedPostId = localStorage.getItem("queuePostId");
      if (savedPostId) {
        console.log(
          "💾 [WaitingListPage] Initial postId from localStorage:",
          savedPostId
        );
        return savedPostId;
      }
    } catch (error) {
      console.error("❌ Error reading queuePostId:", error);
    }
    return null;
  });

  // ✅ ĐỌC maxWaitingTime TỪ LOCALSTORAGE (giống như queueRank)
  const [localMaxWaitingTime, setLocalMaxWaitingTime] = useState(() => {
    try {
      const savedTime = localStorage.getItem("maxWaitingTime");
      if (savedTime) {
        console.log(
          "💾 [WaitingListPage] Initial maxWaitingTime from localStorage:",
          savedTime
        );
        return savedTime;
      }
    } catch (error) {
      console.error("❌ Error reading maxWaitingTime:", error);
    }
    console.log(
      "⚠️ [WaitingListPage] No initial maxWaitingTime in localStorage"
    );
    return null;
  });

  // ✅ Sử dụng useWaitingList hook (chỉ cho cancel function)
  const { cancelWaitingList } = useWaitingList();
  const { fetchBookingsByUser } = useBooking();

  // ✅ WebSocket integration for real-time updates
  console.log("🔍 [WaitingListPage] WebSocket params:");
  console.log("   - user?.id:", user?.id);
  console.log("   - chargingPostId:", chargingPostId);

  const {
    connected,
    messages,
    position,
    maxWaitingTime: wsMaxWaitingTime,
    bookingConfirmed,
  } = useWebSocket(
    user?.id,
    chargingPostId // ← Dùng state riêng thay vì từ waitingData
  );

  console.log("🔌 [WaitingListPage] WebSocket connected:", connected);
  console.log("📨 [WaitingListPage] WebSocket messages:", messages);
  console.log("🎯 [WaitingListPage] WebSocket position:", position);
  console.log(
    "⏰ [WaitingListPage] WebSocket maxWaitingTime:",
    wsMaxWaitingTime
  );
  console.log(
    "🎉 [WaitingListPage] WebSocket bookingConfirmed:",
    bookingConfirmed
  );

  // ✅ Fetch CHI TIẾT waiting/booking khi component mount
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const bookingStatus = localStorage.getItem("bookingStatus");
        console.log(
          "🔍 [WaitingListPage] Fetching detail with status:",
          bookingStatus
        );

        if (bookingStatus === "waiting") {
          const waitingListId = localStorage.getItem("waitingListId");
          if (waitingListId) {
            console.log(
              "� [WaitingListPage] Fetching waiting list detail:",
              waitingListId
            );
            setDetailLoading(true);
            const detail = await getWaitingListById(waitingListId);
            console.log("✅ [WaitingListPage] Waiting list detail:", detail);

            // Map WaitingListResponseDTO to display format
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
              // ✅ Ưu tiên localStorage (nếu đã được update từ WebSocket)
              maxWaitingTime: localMaxWaitingTime || detail.expectedWaitingTime,
            };

            setWaitingData(mappedData);
            setChargingPostId(detail.chargingPostId);

            // ✅ Fetch charging post details
            if (detail.chargingPostId) {
              try {
                console.log(
                  "🔌 [WaitingListPage] Fetching charging post details:",
                  detail.chargingPostId
                );
                const postDetail = await chargingStationService.getPostById(
                  detail.chargingPostId
                );
                console.log(
                  "✅ [WaitingListPage] Charging post details:",
                  postDetail
                );
                setChargingPostData(postDetail);
              } catch (postError) {
                console.error(
                  "❌ [WaitingListPage] Error fetching charging post:",
                  postError
                );
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
            console.log(
              "📞 [WaitingListPage] Fetching booking detail:",
              bookingId
            );
            setDetailLoading(true);
            const detail = await getBookingById(bookingId);
            console.log("✅ [WaitingListPage] Booking detail:", detail);

            // Map BookingResponseDTO to display format
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
              // Add more fields as needed
            };

            setWaitingData(mappedData);
            setChargingPostId(detail.chargingPostId);

            // ✅ Fetch charging post details
            if (detail.chargingPostId) {
              try {
                console.log(
                  "🔌 [WaitingListPage] Fetching charging post details:",
                  detail.chargingPostId
                );
                const postDetail = await chargingStationService.getPostById(
                  detail.chargingPostId
                );
                console.log(
                  "✅ [WaitingListPage] Charging post details:",
                  postDetail
                );
                setChargingPostData(postDetail);
              } catch (postError) {
                console.error(
                  "❌ [WaitingListPage] Error fetching charging post:",
                  postError
                );
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
        } else {
          console.log("⚠️ [WaitingListPage] No bookingStatus in localStorage");
        }
      } catch (error) {
        console.error("❌ [WaitingListPage] Error fetching detail:", error);
        setDetailLoading(false);
      }
    };

    if (user?.id) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // localMaxWaitingTime đã được đọc ở useState initializer

  // ✅ ĐỌC LOCALSTORAGE NGAY KHI COMPONENT MOUNT (không đợi API)
  useEffect(() => {
    console.log("� [WaitingListPage] Mount useEffect RUNNING!");
    console.log("�💾 [WaitingListPage] Checking localStorage on mount...");

    try {
      const savedRank = localStorage.getItem("initialQueueRank");
      const savedPostId = localStorage.getItem("queuePostId");

      console.log("🔍 [WaitingListPage] localStorage values:");
      console.log("   - savedRank:", savedRank);
      console.log("   - savedPostId:", savedPostId);
      console.log("   - typeof savedRank:", typeof savedRank);
      console.log("   - typeof savedPostId:", typeof savedPostId);

      if (savedRank && savedPostId) {
        const initialRank = parseInt(savedRank);
        console.log(
          "✅ [WaitingListPage] Setting initial rank from localStorage:",
          initialRank
        );
        setQueueRank(initialRank);
        setChargingPostId(savedPostId); // Set postId luôn để WebSocket connect
      } else {
        console.log("⚠️ [WaitingListPage] No localStorage data found");
        console.log("   - savedRank is falsy?", !savedRank);
        console.log("   - savedPostId is falsy?", !savedPostId);
      }
    } catch (error) {
      console.error("❌ [WaitingListPage] Error reading localStorage:", error);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  // ✅ Update queue rank ONLY from WebSocket
  useEffect(() => {
    console.log("🎯 [WaitingListPage] Position effect triggered:");
    console.log("   - position value:", position);
    console.log("   - position type:", typeof position);

    if (position !== null && position !== undefined) {
      console.log(
        "✅ [WaitingListPage] Updating queue rank from WebSocket:",
        position
      );

      setQueueRank((oldRank) => {
        // Show notification when position changes
        if (oldRank !== null && position !== oldRank) {
          notification.info({
            message: "Cập nhật vị trí",
            description: `Vị trí của bạn trong hàng đợi: #${position}`,
            placement: "topRight",
            duration: 3,
          });
        }

        // ✅ Cập nhật localStorage với rank mới từ WebSocket
        try {
          if (chargingPostId) {
            localStorage.setItem("initialQueueRank", position.toString());
            localStorage.setItem("queuePostId", chargingPostId);
            console.log(
              "💾 [WaitingListPage] Updated rank in localStorage:",
              position
            );
          }
        } catch (error) {
          console.error(
            "❌ [WaitingListPage] Error updating localStorage:",
            error
          );
        }

        return position;
      });
    } else {
      console.warn(
        "⚠️ [WaitingListPage] Position is null or undefined, not updating queue rank"
      );
    }
  }, [position, chargingPostId]);

  // ✅ Update maxWaitingTime from WebSocket
  useEffect(() => {
    console.log("⏰ [WaitingListPage] MaxWaitingTime effect triggered:");
    console.log("   - wsMaxWaitingTime value:", wsMaxWaitingTime);

    if (wsMaxWaitingTime) {
      console.log(
        "✅ [WaitingListPage] Updating maxWaitingTime from WebSocket:",
        wsMaxWaitingTime
      );

      // ✅ Update state để trigger re-render
      setLocalMaxWaitingTime(wsMaxWaitingTime);

      // ✅ Update waitingData
      setWaitingData((oldData) => {
        if (oldData) {
          return {
            ...oldData,
            maxWaitingTime: wsMaxWaitingTime,
            expectedWaitingTime: wsMaxWaitingTime, // ✅ Update cả expectedWaitingTime
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
    }
  }, [wsMaxWaitingTime]);

  // ✅ HANDLE BOOKING CONFIRMED: waiting -> booking
  useEffect(() => {
    console.log("🔄 [WaitingListPage] BookingConfirmed effect triggered:");
    console.log("   - bookingConfirmed value:", bookingConfirmed);

    if (bookingConfirmed) {
      console.log("🎉 [WaitingListPage] Booking confirmed! Redirecting...");
      console.log("   - bookingId:", bookingConfirmed.bookingId);
      console.log("   - postId:", bookingConfirmed.postId);

      // ✅ Update localStorage
      try {
        localStorage.setItem("bookingId", bookingConfirmed.bookingId);
        localStorage.setItem("bookingStatus", "booking");
        localStorage.removeItem("waitingListId");
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");

        console.log(
          "💾 [WaitingListPage] Updated localStorage for booking status"
        );
      } catch (error) {
        console.error(
          "❌ [WaitingListPage] Error updating localStorage:",
          error
        );
      }

      // ✅ Show notification
      notification.success({
        message: "Chuyển sang Booking!",
        description:
          bookingConfirmed.message ||
          "Bạn đã được chuyển vào booking. Đang chuyển trang...",
        placement: "topRight",
        duration: 3,
      });

      // ✅ Redirect to BookingPage after a short delay
      setTimeout(() => {
        navigate("/app/booking");
      }, 1500);
    }
  }, [bookingConfirmed, navigate]);

  // ✅ POLLING: Check if status changed from waiting to booking (fallback if WebSocket fails)
  useEffect(() => {
    if (!user?.id || !waitingData?.waitingListId) {
      console.log(
        "⏹️ [WaitingListPage] Polling: Missing user or waitingData, skipping"
      );
      return;
    }

    // Only poll if we're still in waiting status
    const bookingStatus = localStorage.getItem("bookingStatus");
    if (bookingStatus !== "waiting") {
      console.log(
        "⏹️ [WaitingListPage] Polling: Not in waiting status, skipping. Current status:",
        bookingStatus
      );
      return;
    }

    console.log("🔄 [WaitingListPage] Starting polling for status changes...");
    console.log("   - userId:", user.id);
    console.log("   - waitingListId:", waitingData.waitingListId);

    const checkStatusInterval = setInterval(async () => {
      try {
        console.log("🔍 [WaitingListPage] Polling: Checking status change...");

        // Method 1: Check if waiting list entry still exists
        try {
          const waitingDetail = await getWaitingListById(
            waitingData.waitingListId
          );
          console.log("📊 [WaitingListPage] Waiting detail:", waitingDetail);

          // If waiting list is cancelled or doesn't exist, check for booking
          if (!waitingDetail || waitingDetail.status === "cancelled") {
            console.log(
              "⚠️ [WaitingListPage] Waiting list not found or cancelled, checking for booking..."
            );

            // Check for booking
            const bookings = await fetchBookingsByUser(user.id);
            console.log("📋 [WaitingListPage] User bookings:", bookings);

            if (bookings && bookings.length > 0) {
              // Find active booking with same charging post
              const activeBooking = bookings.find(
                (b) =>
                  (b.status === "booking" || b.status === "active") &&
                  b.chargingPostId === waitingData.chargingPostId
              );

              if (activeBooking) {
                console.log(
                  "✅ [WaitingListPage] Found active booking:",
                  activeBooking
                );
                clearInterval(checkStatusInterval);

                // Update localStorage
                localStorage.setItem("bookingId", activeBooking.bookingId);
                localStorage.setItem("bookingStatus", "booking");
                localStorage.removeItem("waitingListId");
                localStorage.removeItem("initialQueueRank");
                localStorage.removeItem("queuePostId");

                // Show notification and redirect
                notification.success({
                  message: "Chuyển sang Booking!",
                  description:
                    "Bạn đã được chuyển vào booking. Đang chuyển trang...",
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
          console.log(
            "⚠️ [WaitingListPage] Waiting list API error (might be deleted):",
            waitingError.message
          );

          // If waiting list not found (404), definitely check for booking
          if (
            waitingError.response?.status === 404 ||
            waitingError.message?.includes("404")
          ) {
            console.log(
              "🔄 [WaitingListPage] Waiting list deleted (404), checking for booking..."
            );

            const bookings = await fetchBookingsByUser(user.id);
            console.log(
              "📋 [WaitingListPage] User bookings after 404:",
              bookings
            );

            if (bookings && bookings.length > 0) {
              const activeBooking = bookings.find(
                (b) =>
                  (b.status === "booking" || b.status === "active") &&
                  b.chargingPostId === waitingData.chargingPostId
              );

              if (activeBooking) {
                console.log(
                  "✅ [WaitingListPage] Found active booking after 404:",
                  activeBooking
                );
                clearInterval(checkStatusInterval);

                localStorage.setItem("bookingId", activeBooking.bookingId);
                localStorage.setItem("bookingStatus", "booking");
                localStorage.removeItem("waitingListId");
                localStorage.removeItem("initialQueueRank");
                localStorage.removeItem("queuePostId");

                notification.success({
                  message: "Chuyển sang Booking!",
                  description:
                    "Bạn đã được chuyển vào booking. Đang chuyển trang...",
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

        // Method 2: Always check for new bookings
        const bookings = await fetchBookingsByUser(user.id);
        console.log(
          "📋 [WaitingListPage] Polling - Current bookings:",
          bookings
        );

        if (bookings && bookings.length > 0) {
          // Find any active booking for this charging post
          const activeBooking = bookings.find(
            (b) =>
              (b.status === "booking" || b.status === "active") &&
              b.chargingPostId === waitingData.chargingPostId
          );

          if (activeBooking) {
            console.log(
              "✅ [WaitingListPage] Polling - Found active booking:",
              activeBooking
            );
            clearInterval(checkStatusInterval);

            localStorage.setItem("bookingId", activeBooking.bookingId);
            localStorage.setItem("bookingStatus", "booking");
            localStorage.removeItem("waitingListId");
            localStorage.removeItem("initialQueueRank");
            localStorage.removeItem("queuePostId");

            notification.success({
              message: "Chuyển sang Booking!",
              description:
                "Bạn đã được chuyển vào booking. Đang chuyển trang...",
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
        console.error("❌ [WaitingListPage] Error polling status:", error);
      }
    }, 3000); // Poll every 3 seconds (faster)

    // Cleanup interval on unmount
    return () => {
      console.log("🛑 [WaitingListPage] Stopping polling interval");
      clearInterval(checkStatusInterval);
    };
  }, [
    user?.id,
    waitingData?.waitingListId,
    waitingData?.chargingPostId,
    navigate,
    fetchBookingsByUser,
  ]);

  // ✅ Show notifications for WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log("📩 [WaitingListPage] New WebSocket message:", latestMessage);

      notification.info({
        message: "Thông báo hàng đợi",
        description: latestMessage.text,
        placement: "topRight",
        duration: 5,
      });
    }
  }, [messages]);

  // ✅ Handler hủy waiting
  const handleCancelWaiting = async () => {
    if (!waitingData?.waitingListId) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin hàng đợi.",
      });
      return;
    }

    try {
      // ✅ LƯU thời gian countdown hiện tại TRƯỚC KHI hủy
      const waitingCountdownKey = `countdown_${waitingData.waitingListId}`;
      const bookingCountdownKey = `countdown_${waitingData.bookingId}`;
      const frozenWaitingKey = `countdown_frozen_${waitingData.waitingListId}`;
      const frozenBookingKey = `countdown_frozen_${waitingData.bookingId}`;

      try {
        // Lưu frozen time cho waiting
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
            const frozenTime = `${String(hours).padStart(2, "0")}:${String(
              mins
            ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

            localStorage.setItem(frozenWaitingKey, frozenTime);
            console.log(
              "🧊 [WaitingListPage] Frozen waiting countdown:",
              frozenTime
            );
          }
        }

        // Lưu frozen time cho booking (nếu có)
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
            const frozenTime = `${String(hours).padStart(2, "0")}:${String(
              mins
            ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

            localStorage.setItem(frozenBookingKey, frozenTime);
            console.log(
              "🧊 [WaitingListPage] Frozen booking countdown:",
              frozenTime
            );
          }
        }
      } catch (err) {
        console.error("❌ [WaitingListPage] Error freezing countdown:", err);
      }

      await cancelWaitingList(waitingData.waitingListId);

      // ✅ Xóa tất cả localStorage khi cancel (trừ frozen time)
      try {
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");
        localStorage.removeItem("waitingListId");
        localStorage.removeItem("bookingId");
        localStorage.removeItem("bookingStatus");
        localStorage.removeItem("maxWaitingTime");

        // ✅ XÓA COUNTDOWN endTime (để dừng countdown)
        if (waitingData.waitingListId) {
          localStorage.removeItem(waitingCountdownKey);
          console.log(
            "🗑️ [WaitingListPage] Removed countdown for waitingListId:",
            waitingData.waitingListId
          );
        }
        if (waitingData.bookingId) {
          localStorage.removeItem(bookingCountdownKey);
          console.log(
            "🗑️ [WaitingListPage] Removed countdown for bookingId:",
            waitingData.bookingId
          );
        }

        console.log(
          "🗑️ [WaitingListPage] Cleared all localStorage after cancel (frozen time preserved)"
        );
      } catch (error) {
        console.error(
          "❌ [WaitingListPage] Error clearing localStorage:",
          error
        );
      }

      // ✅ Update local state immediately
      const updatedWaitingData = {
        ...waitingData,
        status: "cancelled",
      };
      setWaitingData(updatedWaitingData);

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
        description: "Hủy hàng đợi thành công.",
      });
    } catch (error) {
      console.error("❌ Error canceling waiting:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể hủy hàng đợi. Vui lòng thử lại.",
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
        <Spin size="large" spinning={true} tip="Đang tải thông tin hàng đợi...">
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== FORBIDDEN STATE (403) ====================
  const isForbidden =
    !user ||
    (waitingData &&
      user.id !== waitingData.userId &&
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
                <p>Bạn không có quyền truy cập hàng đợi này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Hàng đợi này có thể thuộc về người dùng khác hoặc bạn không có
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
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </Space>
        </div>
      </div>
    );
  }

  // ==================== NO WAITING STATE ====================
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
          {/* WebSocket Connection Status */}
          {waitingData && (
            <Alert
              message={
                <Space>
                  <WifiOutlined style={{ fontSize: "16px" }} />
                  <span>
                    {connected
                      ? "Kết nối thời gian thực đang hoạt động"
                      : "Đang kết nối lại WebSocket..."}
                  </span>
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

          {/* Row 1: Session Info & Waiting Time */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <SessionInfo sessionData={waitingData} />
            </Col>

            <Col xs={24} lg={12}>
              <WaitingTime sessionData={waitingData} />
            </Col>
          </Row>

          {/* Row 2: Technical Details & Queue Info */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails
                sessionData={waitingData}
                chargingPostData={chargingPostData}
              />
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

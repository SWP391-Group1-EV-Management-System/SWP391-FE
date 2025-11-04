import React, { useEffect, useState } from "react";
import { Row, Col, Space, Spin, Alert, Button, notification } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import { SessionInfo } from "../components/energy/SessionInfo";
import { WaitingTime } from "../components/energy/WaitingTime";
import WaitingQueueInfo from "../components/energy/WaitingQueueInfo";
import useWaitingList from "../hooks/useWaitingList";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { ClockCircleOutlined, LockOutlined, HomeOutlined, WifiOutlined } from "@ant-design/icons";

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

  // ✅ ĐỌC LOCALSTORAGE NGAY TRONG useState INITIALIZER
  const [queueRank, setQueueRank] = useState(() => {
    try {
      const savedRank = localStorage.getItem("initialQueueRank");
      if (savedRank) {
        console.log("💾 [WaitingListPage] Initial rank from localStorage:", savedRank);
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
        console.log("💾 [WaitingListPage] Initial postId from localStorage:", savedPostId);
        return savedPostId;
      }
    } catch (error) {
      console.error("❌ Error reading queuePostId:", error);
    }
    return null;
  });

  // ✅ Sử dụng useWaitingList hook
  const {
    loading: waitingLoading,
    error: waitingError,
    waitingLists,
    fetchWaitingListByUser,
    cancelWaitingList,
  } = useWaitingList();

  // ✅ WebSocket integration for real-time updates
  console.log("🔍 [WaitingListPage] WebSocket params:");
  console.log("   - user?.id:", user?.id);
  console.log("   - chargingPostId:", chargingPostId);

  const { connected, messages, position } = useWebSocket(
    user?.id,
    chargingPostId // ← Dùng state riêng thay vì từ waitingData
  );

  console.log("🔌 [WaitingListPage] WebSocket connected:", connected);
  console.log("📨 [WaitingListPage] WebSocket messages:", messages);
  console.log("🎯 [WaitingListPage] WebSocket position:", position);

  // ✅ Fetch waiting list data khi component mount
  useEffect(() => {
    if (user?.id) {
      console.log("🔍 [WaitingListPage] Fetching waiting list for userId:", user.id);
      fetchWaitingListByUser(user.id);
    }
  }, [user?.id, fetchWaitingListByUser]);

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
        console.log("✅ [WaitingListPage] Setting initial rank from localStorage:", initialRank);
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

  // ✅ Set waiting data khi có waitingLists
  useEffect(() => {
    console.log("📦 [WaitingListPage] Waiting lists data:", waitingLists);

    if (waitingLists && waitingLists.length > 0) {
      // ✅ Lấy waiting list đầu tiên với status 'active' hoặc 'waiting'
      const activeWaiting =
        waitingLists.find((w) => w.status?.toLowerCase() === "active" || w.status?.toLowerCase() === "waiting") ||
        waitingLists[0];

      console.log("✅ [WaitingListPage] Active waiting:", activeWaiting);
      console.log("🔍 [WaitingListPage] Waiting structure:", {
        hasPost: !!activeWaiting.post,
        hasStation: !!activeWaiting.post?.station,
        waitingListId: activeWaiting.waitingListId,
        keys: Object.keys(activeWaiting),
      });

      // ⚠️ TEMPORARY FIX: Map waiting list data to match session structure
      const mappedWaiting = {
        ...activeWaiting,
        maxPower: activeWaiting.post?.maxPower || activeWaiting.chargingPost?.maxPower || 0,
        typeCharging: activeWaiting.post?.typeCharging || activeWaiting.chargingPost?.typeCharging || [],
        pricePerKwh: activeWaiting.post?.pricePerKwh || activeWaiting.chargingPost?.pricePerKwh || 0,
        stationName: activeWaiting.post?.station?.stationName || "Trạm sạc",
        address: activeWaiting.post?.station?.address || "",
        // Map expectedWaitingTime to maxWaitingTime for WaitingTime component
        maxWaitingTime: activeWaiting.expectedWaitingTime || 0,
      };

      console.log("🔧 [WaitingListPage] Mapped waiting:", mappedWaiting);
      setWaitingData(mappedWaiting);

      // ✅ Set chargingPostId để WebSocket kết nối (nếu chưa có từ localStorage)
      const postId = activeWaiting.chargingPostId || activeWaiting.post?.idChargingPost;
      console.log("🔌 [WaitingListPage] Setting charging post ID for WebSocket:", postId);

      // Chỉ update nếu khác với postId hiện tại
      if (postId && postId !== chargingPostId) {
        setChargingPostId(postId);
      }

      // ⚠️ localStorage đã được đọc ở useEffect mount, không cần đọc lại ở đây
      // Rank đã được set từ localStorage hoặc sẽ được update từ WebSocket

      // Queue rank sẽ được cập nhật từ WebSocket khi có message mới

      // Set status config
      const config = {
        color: "warning",
        icon: "⏳",
        text: "Đang chờ",
        isCompleted: false,
        isCharging: false,
      };

      setStatusConfig(config);
    } else if (waitingLists && waitingLists.length === 0) {
      // ✅ CHỈ xóa localStorage khi XÁC NHẬN không có waiting list (array rỗng)
      // ❌ KHÔNG xóa khi waitingLists = null (đang loading)
      try {
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");
        console.log("🗑️ [WaitingListPage] Cleared rank from localStorage (confirmed no waiting list)");
      } catch (error) {
        console.error("❌ [WaitingListPage] Error clearing localStorage:", error);
      }

      setWaitingData(null);
      setStatusConfig(null);
      setQueueRank(null);
      setChargingPostId(null);
    }
    // else: waitingLists = null → Đang loading → GIỮ localStorage!
  }, [waitingLists, user?.id, chargingPostId]);

  // ✅ Update queue rank ONLY from WebSocket
  useEffect(() => {
    console.log("🎯 [WaitingListPage] Position effect triggered:");
    console.log("   - position value:", position);
    console.log("   - position type:", typeof position);

    if (position !== null && position !== undefined) {
      console.log("✅ [WaitingListPage] Updating queue rank from WebSocket:", position);

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
            console.log("💾 [WaitingListPage] Updated rank in localStorage:", position);
          }
        } catch (error) {
          console.error("❌ [WaitingListPage] Error updating localStorage:", error);
        }

        return position;
      });
    } else {
      console.warn("⚠️ [WaitingListPage] Position is null or undefined, not updating queue rank");
    }
  }, [position, chargingPostId]);

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

  // Listen for waiting list events
  useEffect(() => {
    const handleWaitingCreated = (e) => {
      console.log("waitingCreated event received:", e?.detail);
      if (user?.id) {
        fetchWaitingListByUser(user.id);
      }
    };

    window.addEventListener("waitingCreated", handleWaitingCreated);
    return () => window.removeEventListener("waitingCreated", handleWaitingCreated);
  }, [user?.id, fetchWaitingListByUser]);

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
      await cancelWaitingList(waitingData.waitingListId);

      // ✅ Xóa rank từ localStorage khi cancel
      try {
        localStorage.removeItem("initialQueueRank");
        localStorage.removeItem("queuePostId");
        console.log("🗑️ [WaitingListPage] Cleared rank from localStorage after cancel");
      } catch (error) {
        console.error("❌ [WaitingListPage] Error clearing localStorage:", error);
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
  if (waitingLoading || authLoading) {
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
            <Button
              onClick={() => {
                if (user?.id) {
                  fetchWaitingListByUser(user.id);
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
  if (waitingError) {
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
              <p>{waitingError.message || "Đã có lỗi xảy ra"}</p>
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
                  fetchWaitingListByUser(user.id);
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
              <Button
                size="small"
                onClick={() => {
                  if (user?.id) {
                    fetchWaitingListByUser(user.id);
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
          {/* WebSocket Connection Status */}
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
              <TechnicalDetails sessionData={waitingData} />
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

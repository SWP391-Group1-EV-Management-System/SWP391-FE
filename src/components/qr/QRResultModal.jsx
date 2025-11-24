import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router";
import { message as staticMessage, ConfigProvider, App } from "antd";
import { IoMdBatteryCharging } from "react-icons/io";
import { FaRegClock } from "react-icons/fa";
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "../../assets/styles/QRResultModal.css";
import { energySessionService } from "../../services/energySessionService";
import { useAuth } from "../../hooks/useAuth";
import { useRandomPin } from "../../hooks/useRandomPin";
import { useChargingStations } from "../../hooks/useChargingStations";
import { useChargingPreference } from "../../hooks/useChargingPreference";
import { LoadingSpinner } from "../../components/common";
import { setDriverStatus } from "../../utils/statusUtils";

function QRResultModal({ isOpen, onClose, qrResult, stationData }) {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();
  const { message } = App.useApp();
  const { pinData, fetchRandomPin } = useRandomPin();
  const { fetchPostById, fetchStationById } = useChargingStations({
    autoFetch: false,
  });
  const { updatePreference } = useChargingPreference();

  // ✅ State cho thời gian sạc - KHÔNG còn slider, chỉ hiển thị
  const [chargingTimeMinutes, setChargingTimeMinutes] = useState(0);
  const [chargingTimeSeconds, setChargingTimeSeconds] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [expectedEndTime, setExpectedEndTime] = useState(null);

  const formatLocalDateTime = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }, []);

  const fetchPostData = useCallback(async () => {
    try {
      setDataLoading(true);
      const postInfo = await fetchPostById(qrResult);
      setPostData(postInfo);

      const stationId =
        postInfo.chargingStationId ||
        postInfo.chargingStation ||
        postInfo.stationId;

      if (stationId) {
        const stationDetails = await fetchStationById(stationId);
        setStationInfo(stationDetails);
      } else {
        setStationInfo({
          name: "Trạm không xác định",
          address: "Không có thông tin địa chỉ",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching post data:", error);
      message.error("Không thể lấy thông tin trụ sạc. Vui lòng thử lại!");
      setPostData({
        id: qrResult,
        name: "Trụ không xác định",
        powerDisplay: "N/A",
        status: "unknown",
        chargingStationId: null,
      });
      setStationInfo({
        name: "Trạm không xác định",
        address: "Địa chỉ không xác định",
      });
    } finally {
      setDataLoading(false);
    }
  }, [qrResult, message, fetchPostById, fetchStationById]);

  // ✅ Fetch data khi modal mở
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !qrResult) return;

      await fetchPostData();

      let userProfile = user;
      if (!userProfile) {
        try {
          userProfile = await fetchUserProfile();
        } catch (error) {
          console.error("❌ Error fetching user profile:", error);
        }
      }

      const userId = userProfile?.userId || userProfile?.id;
      if (userId && qrResult) {
        // ✅ Gọi API với userId và postId
        const result = await fetchRandomPin(userId, qrResult);
        console.log("🔋 [QRResultModal] Fetched pin data:", result);

        if (result) {
          // ✅ Set thời gian sạc = maxSecond (thời gian đầy pin)
          setChargingTimeSeconds(result.maxSecond);
          setChargingTimeMinutes(result.maxMinute);

          // ✅ Tính expectedEndTime
          const now = new Date();
          const endTime = new Date(now.getTime() + result.maxSecond * 1000);
          setExpectedEndTime(endTime);

          console.log("⏱️ [QRResultModal] Charging time set to:", {
            seconds: result.maxSecond,
            minutes: result.maxMinute,
            endTime: endTime.toLocaleString("vi-VN"),
          });
        }
      } else {
        console.warn("⚠️ [QRResultModal] Missing userId or postId");
      }
    };

    fetchData();
  }, [isOpen, qrResult]);

  const handleStartCharging = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!postData) {
        message.error("Không có thông tin trụ sạc");
        return;
      }

      let userProfile = user;
      if (!userProfile) {
        userProfile = await fetchUserProfile();
      }

      const userId = userProfile?.userId || userProfile?.id;

      if (!userId) {
        message.error("Vui lòng đăng nhập để bắt đầu sạc");
        return;
      }

      if (!expectedEndTime) {
        message.error("Không thể tính toán thời gian sạc. Vui lòng thử lại!");
        return;
      }

      // ✅ Bước 1: Cập nhật preference với maxSecond (giây)
      if (pinData?.pinNow && chargingTimeSeconds) {
        const preferenceResult = await updatePreference(
          userId,
          pinData.pinNow,
          chargingTimeSeconds // ✅ Gửi giây, không phải phút
        );

        if (!preferenceResult.success) {
          message.error("Không thể cập nhật thông tin sạc");
          return;
        }

        console.log(
          "✅ Preference updated with maxSecond:",
          chargingTimeSeconds
        );
      }

      // ✅ Bước 2: Tạo session
      const formattedEndTime = formatLocalDateTime(expectedEndTime);

      const sessionData = {
        booking: {
          bookingId: "",
          user: userId,
          chargingPost: postData.id,
          car: "CAR001",
        },
        expectedEndTime: formattedEndTime,
      };

      const response = await energySessionService.createSession(sessionData);

      // Robustly check for backend 'overpay' signals in many possible wrapper shapes
      const checkOverpay = (obj) => {
        if (!obj) return false;
        try {
          const s = (obj.status || obj.message || obj.msg || "")
            .toString()
            .toLowerCase();
          const sid = (obj.sessionId || obj.chargingSessionId || "")
            .toString()
            .toLowerCase();
          if (s.includes("overpay") || sid === "overpaying") return true;
          if (obj.idAction && obj.idAction === "overpaying") return true;
        } catch (e) {
          // ignore
        }
        return false;
      };

      // Possible places where the backend payload may be stored after service normalization
      const candidates = [
        response?.data,
        response?.data?.message,
        response?.message,
        response?.errorDetails?.data,
        response?.data?.data,
      ];

      const isOverpay = candidates.some((c) => checkOverpay(c));

      if (isOverpay) {
        console.warn(
          "⚠️ [QRResultModal] User overpaying - blocking success message",
          response
        );
        message.error(
          "Tài khoản đang có khoản nợ trên 100.000 VND. Vui lòng thanh toán trước khi bắt đầu phiên sạc."
        );
        onClose();
        return;
      }

      if (response.success) {
        console.log("✅ Create session response:", response);

        const status =
          response.data?.status ||
          response.data?.message?.status ||
          response.message?.status ||
          response.status;

        let sessionId =
          response.data?.sessionId ||
          response.data?.chargingSessionId ||
          response.data?.message?.sessionId ||
          response.message?.sessionId ||
          response.sessionId ||
          null;

        if (
          status === "trụ đang bận" ||
          status === "bạn đang có đặt chỗ khác hoặc trong hàng đợi"
        ) {
          console.warn("⚠️ [QRResultModal] Trụ đang bận:", status);

          const isStationBusy = status === "trụ đang bận";

          message.warning({
            content: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "4px",
                      fontSize: "15px",
                    }}
                  >
                    {isStationBusy
                      ? "Trụ đang bận"
                      : "Bạn đang có đặt chỗ khác"}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: "1.5",
                    }}
                  >
                    {isStationBusy
                      ? "Trụ này đã được đặt chỗ. Vui lòng quét QR trụ khác!"
                      : "Vui lòng hoàn thành đặt chỗ hiện tại trước khi sạc tại trụ khác!"}
                  </div>
                </div>
              </div>
            ),
            duration: 5,
            style: { marginTop: "20vh" },
            icon: <WarningOutlined style={{ color: "#faad14" }} />,
          });

          onClose();
          return;
        }

        if (!sessionId && typeof response?.data?.message === "string") {
          const maybe = response.data.message.trim();
          if (maybe && !maybe.includes(" ") && maybe.length > 3)
            sessionId = maybe;
        }

        if (status) {
          setDriverStatus(status);
          console.log("✅ Saved status to localStorage:", status);
        }

        if (sessionId) {
          localStorage.setItem("currentSessionId", sessionId);
          console.log("✅ Saved sessionId to localStorage:", sessionId);

          if (pinData?.pinNow && chargingTimeMinutes) {
            localStorage.setItem(
              "batteryCountdown",
              JSON.stringify({
                currentBattery: pinData.pinNow,
                remainingMinutes: chargingTimeMinutes,
                startTime: new Date().toISOString(),
              })
            );
            console.log("✅ Saved battery countdown info");
          }

          try {
            localStorage.removeItem("currentSessionFinished");
          } catch (e) {
            console.warn("Failed to remove currentSessionFinished:", e);
          }

          try {
            if (typeof window !== "undefined") {
              if (typeof window.resetSessionAutoRefetchFlag === "function") {
                window.resetSessionAutoRefetchFlag();
              } else {
                window.__sessionAutoRefetchHandled = false;
              }
              console.log("🔁 Reset global auto-refetch flag for new session");
            }
          } catch (err) {
            console.warn("Failed to reset global auto-refetch flag:", err);
          }

          message.success("Bắt đầu phiên sạc thành công!");

          try {
            window.dispatchEvent(
              new CustomEvent("sessionCreated", { detail: { sessionId } })
            );
          } catch (e) {
            console.warn("Failed to dispatch sessionCreated event:", e);
          }

          onClose();

          const locPath = window.location.pathname || location.pathname;
          const isVirtualStation = locPath.includes("/virtualstation/");

          if (isVirtualStation) {
            console.log(
              "🎯 [QRResultModal] On VirtualStationPage, not navigating."
            );
          } else if (locPath !== "/app/session") {
            navigate("/app/session");
          }
        } else {
          console.warn("⚠️ Không nhận được sessionId từ BE");
          message.warning("Phiên sạc đã được tạo nhưng không nhận được ID.");
          onClose();
          navigate("/app/home");
        }
      } else {
        const errorMsg = response.message || "Không thể bắt đầu phiên sạc";
        console.error("❌ Failed to create session:", errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("❌ Unexpected Error in handleStartCharging:", error);
      message.error("Lỗi không xác định. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  }, [
    postData,
    user,
    fetchUserProfile,
    expectedEndTime,
    formatLocalDateTime,
    onClose,
    navigate,
    message,
    pinData,
    chargingTimeSeconds,
    chargingTimeMinutes,
  ]);

  // ✅ Format thời gian hiển thị
  const formatChargingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes} phút ${remainingSeconds} giây`
        : `${minutes} phút`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }

    return remainingSeconds > 0
      ? `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
      : `${hours}h ${remainingMinutes}m`;
  };

  if (!isOpen) return null;

  return createPortal(
    <ConfigProvider theme={{ token: { zIndexPopupBase: 10010 } }}>
      <div className="qr-result-modal-overlay" onClick={onClose}>
        <div className="qr-result-modal" onClick={(e) => e.stopPropagation()}>
          <div className="qr-result-modal-header">
            <h3>Kết quả quét QR</h3>
            <button
              className="qr-result-close-btn"
              onClick={onClose}
              aria-label="Đóng"
            >
              <CloseOutlined />
            </button>
          </div>

          <div className="qr-result-modal-content">
            {dataLoading ? (
              <LoadingSpinner
                type="pulse"
                size="medium"
                color="primary"
                text="Đang tải thông tin trụ sạc..."
              />
            ) : (
              <>
                <div className="qr-result-info">
                  <h4>Thông tin trụ sạc</h4>
                  <p>
                    <strong>Mã trụ:</strong> {qrResult}
                  </p>
                  <p>
                    <strong>Tên trụ:</strong>{" "}
                    {postData?.name || `Trụ ${qrResult}`}
                  </p>
                  <p>
                    <strong>Trạm:</strong> {stationInfo?.name || "Đang tải..."}
                    {(postData?.chargingStation ||
                      postData?.chargingStationId) && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginLeft: "8px",
                        }}
                      >
                        (ID:{" "}
                        {postData.chargingStation || postData.chargingStationId}
                        )
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong>{" "}
                    {stationInfo?.address ||
                      stationInfo?.location ||
                      "Chưa có thông tin"}
                  </p>
                  <p>
                    <strong>Công suất:</strong>{" "}
                    {postData?.powerDisplay ||
                      `${postData?.maxPower || "N/A"} kW`}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {postData?.status === "available"
                      ? "Sẵn sàng"
                      : postData?.status === "maintenance"
                      ? "Bảo trì"
                      : "Không xác định"}
                  </p>
                  {postData?.feeDisplay && (
                    <p>
                      <strong>Giá sạc:</strong> {postData.feeDisplay}
                    </p>
                  )}
                </div>

                {/* ✅ Hiển thị thông tin pin và thời gian SẠC ĐẦY (không có slider) */}
                <div className="charging-controls">
                  <h4>Thông tin sạc pin</h4>

                  {pinData && chargingTimeSeconds > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {/* Pin hiện tại */}
                      <div
                        style={{
                          padding: "14px 16px",
                          background:
                            "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                          border: "1px solid #fbbf24",
                          borderRadius: "10px",
                          fontSize: "14px",
                          color: "#78350f",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <IoMdBatteryCharging size={20} />
                          <strong>Mức pin hiện tại:</strong>
                        </div>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#92400e",
                          }}
                        >
                          {pinData.pinNow}%
                        </div>
                      </div>

                      {/* Thời gian sạc đầy */}
                      <div
                        style={{
                          padding: "14px 16px",
                          background:
                            "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                          border: "1px solid #3b82f6",
                          borderRadius: "10px",
                          fontSize: "14px",
                          color: "#1e3a8a",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <FaRegClock size={18} />
                          <strong>Thời gian sạc đầy pin:</strong>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#1e40af",
                          }}
                        >
                          {formatChargingTime(chargingTimeSeconds)}
                        </div>
                      </div>

                      {/* Thời gian hoàn thành dự kiến */}
                      {expectedEndTime && (
                        <div
                          style={{
                            padding: "14px 16px",
                            background:
                              "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                            border: "1px solid #0ea5e9",
                            borderRadius: "10px",
                            fontSize: "14px",
                            color: "#0c4a6e",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              marginBottom: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <ClockCircleOutlined />
                            Thời gian hoàn thành dự kiến
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#0369a1",
                            }}
                          >
                            {expectedEndTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            <span
                              style={{ fontSize: "14px", fontWeight: "500" }}
                            >
                              (
                              {expectedEndTime.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                              )
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#666",
                      }}
                    >
                      Đang tải thông tin pin...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="qr-result-modal-footer">
            <button
              className="qr-result-btn qr-result-btn-secondary"
              onClick={onClose}
              disabled={isLoading || dataLoading}
            >
              Đóng
            </button>
            <button
              className="qr-result-btn qr-result-btn-primary"
              onClick={handleStartCharging}
              disabled={isLoading || dataLoading || !postData || !pinData}
            >
              {isLoading ? "Đang xử lý..." : "Bắt đầu sạc đầy pin"}
            </button>
          </div>
        </div>
      </div>
    </ConfigProvider>,
    document.body
  );
}

export default QRResultModal;

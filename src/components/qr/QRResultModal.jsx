import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router";
import { message as staticMessage, ConfigProvider, App } from "antd";
import "../../assets/styles/QRResultModal.css";
import ElasticSlider from "./ElasticSlider";
import { energySessionService } from "../../services/energySessionService";
import { useAuth } from "../../hooks/useAuth";
import { chargingStationService } from "../../services/chargingStationService";
import LoadingSpinner from "../common/LoadingSpinner";
import { setDriverStatus } from "../../utils/statusUtils"; // ← IMPORT HELPER

function QRResultModal({ isOpen, onClose, qrResult, stationData }) {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();
  const { message } = App.useApp();
  const [selectedChargingTime, setSelectedChargingTime] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [expectedEndTime, setExpectedEndTime] = useState(null);

  const chargingConfig = {
    minChargingTime: 15,
    maxChargingTime: 240,
    defaultChargingTime: 60,
    stepSize: 15,
  };

  const formatLocalDateTime = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }, []);

  const handleChargingTimeChange = useCallback((chargingMinutes) => {
    setSelectedChargingTime(chargingMinutes);
    const now = new Date();
    const endTime = new Date(now.getTime() + chargingMinutes * 60 * 1000);
    setExpectedEndTime(endTime);
  }, []);

  const fetchPostData = useCallback(async () => {
    try {
      setDataLoading(true);
      const postInfo = await chargingStationService.getPostById(qrResult);
      setPostData(postInfo);

      const stationId =
        postInfo.chargingStationId ||
        postInfo.chargingStation ||
        postInfo.stationId;

      if (stationId) {
        const stationDetails = await chargingStationService.getStationById(
          stationId
        );
        setStationInfo(stationDetails);
      } else {
        setStationInfo({
          name: "Trạm không xác định",
          address: "Không có thông tin địa chỉ",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trụ sạc:", error);
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
  }, [qrResult, message]);

  useEffect(() => {
    if (isOpen && qrResult) {
      fetchPostData();
    }
  }, [isOpen, qrResult, fetchPostData]);

  useEffect(() => {
    if (isOpen && selectedChargingTime) {
      handleChargingTimeChange(selectedChargingTime);
    }
  }, [isOpen]);

  // ✅ UPDATED: Xử lý response có status và sessionId
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

      if (response.success) {
        console.log("✅ Create session response:", response);

        // ✅ Lấy status và sessionId từ response
        // Hỗ trợ nhiều dạng BE có thể trả: top-level fields hoặc nằm trong data.message
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

        // Nếu data.message là string và chưa có sessionId, thử lấy string nếu nó trông giống id
        if (!sessionId && typeof response?.data?.message === "string") {
          const maybe = response.data.message.trim();
          if (maybe && !maybe.includes(" ") && maybe.length > 3)
            sessionId = maybe;
        }

        // ✅ Lưu status vào localStorage (sử dụng helper)
        if (status) {
          setDriverStatus(status);
          console.log("✅ Saved status to localStorage:", status);
        }

        // ✅ Lưu sessionId vào localStorage
        if (sessionId) {
          localStorage.setItem("currentSessionId", sessionId);
          console.log("✅ Saved sessionId to localStorage:", sessionId);

          // Clear finished marker
          try {
            localStorage.removeItem("currentSessionFinished");
          } catch (e) {
            console.warn("Failed to remove currentSessionFinished:", e);
          }

          message.success("Bắt đầu phiên sạc thành công!");

          // Dispatch a global event so the session page (if mounted) can refresh
          try {
            window.dispatchEvent(
              new CustomEvent("sessionCreated", { detail: { sessionId } })
            );
          } catch (e) {
            console.warn("Failed to dispatch sessionCreated event:", e);
          }

          // Close modal
          onClose();

          // If not already on session page, navigate there. If already on
          // /app/session the page will receive the event and call refetch().
          const locPath = window.location.pathname || location.pathname;
          if (locPath !== "/app/session") {
            navigate("/app/session");
          }
        } else {
          console.warn("⚠️ Không nhận được sessionId từ BE");
          console.warn("⚠️ Response:", response);

          message.warning(
            "Phiên sạc đã được tạo nhưng không nhận được ID. Vui lòng kiểm tra lại."
          );
          onClose();
          navigate("/app/home");
        }
      } else {
        const errorMsg = response.message || "Không thể bắt đầu phiên sạc";
        const errorStatus = response.errorDetails?.status;

        console.error("❌ Failed to create session:", {
          message: errorMsg,
          status: errorStatus,
          details: response.errorDetails,
        });

        if (errorStatus) {
          message.error(`${errorMsg} (Status: ${errorStatus})`);
        } else {
          message.error(errorMsg);
        }
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
  ]);

  if (!isOpen) return null;

  return createPortal(
    <ConfigProvider
      theme={{
        token: {
          zIndexPopupBase: 10010,
        },
      }}
    >
      <div className="qr-result-modal-overlay" onClick={onClose}>
        <div className="qr-result-modal" onClick={(e) => e.stopPropagation()}>
          <div className="qr-result-modal-header">
            <h3>Kết quả quét QR</h3>
            <button className="qr-result-close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="qr-result-modal-content">
            {dataLoading ? (
              <LoadingSpinner
                size="medium"
                text="Đang tải thông tin trụ sạc..."
                fullHeight={false}
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
                    <strong>Trạm:</strong>{" "}
                    {stationInfo?.name || "Đang tải thông tin trạm..."}
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
                      "Chưa có thông tin địa chỉ"}
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

                <div className="charging-controls">
                  <h4>Cài đặt thời gian sạc</h4>
                  <div className="slider-section">
                    <label>Thời gian sạc mong muốn</label>
                    <ElasticSlider
                      defaultValue={selectedChargingTime}
                      minTime={chargingConfig.minChargingTime}
                      maxTime={chargingConfig.maxChargingTime}
                      stepSize={chargingConfig.stepSize}
                      onTimeChange={handleChargingTimeChange}
                    />

                    {expectedEndTime && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 14px",
                          background:
                            "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                          border: "1px solid #bae6fd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#0c4a6e",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                          ⏰ Thời gian hoàn thành dự kiến
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
                          <span style={{ fontSize: "13px", fontWeight: "500" }}>
                            (
                            {expectedEndTime.toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                            )
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            marginTop: "4px",
                            color: "#64748b",
                          }}
                        >
                          Thời gian sạc: {selectedChargingTime} phút
                        </div>
                      </div>
                    )}
                  </div>
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
              disabled={isLoading || dataLoading || !postData}
            >
              {isLoading ? "Đang xử lý..." : "Bắt đầu sạc"}
            </button>
          </div>
        </div>
      </div>
    </ConfigProvider>,
    document.body
  );
}

export default QRResultModal;

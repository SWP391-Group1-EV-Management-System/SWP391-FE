import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { message as staticMessage, ConfigProvider, App } from "antd";
import "../../assets/styles/QRResultModal.css";
import ElasticSlider from "./ElasticSlider";
import { BsBattery, BsLightning } from "react-icons/bs";
import { energySessionService } from "../../services/energySessionService";
import { useAuth } from "../../hooks/useAuth";
import { chargingStationService } from "../../services/chargingStationService";
import LoadingSpinner from "../common/LoadingSpinner";

function QRResultModal({ isOpen, onClose, qrResult, stationData }) {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();
  const { message } = App.useApp(); // Dùng message hook từ App context
  const [selectedChargingTime, setSelectedChargingTime] = useState(60); // Thời gian sạc (phút)
  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [expectedEndTime, setExpectedEndTime] = useState(null); // Thời gian kết thúc dự kiến

  // Cấu hình mặc định cho slider thời gian sạc
  const chargingConfig = {
    minChargingTime: 15, // 15 phút
    maxChargingTime: 240, // 4 giờ
    defaultChargingTime: 60, // 1 giờ
    stepSize: 15, // Bước nhảy 15 phút
  };

  // Utility function to format date to local datetime string
  const formatLocalDateTime = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }, []);

  // Handler khi slider thay đổi - MUST use useCallback for stable reference
  const handleChargingTimeChange = useCallback((chargingMinutes) => {
    // Update charging time state
    setSelectedChargingTime(chargingMinutes);

    // Tính toán expectedEndTime: Current Time + Charging Duration
    const now = new Date();
    const endTime = new Date(now.getTime() + chargingMinutes * 60 * 1000);

    setExpectedEndTime(endTime);
  }, []);

  // Hàm lấy thông tin trụ sạc từ API (memoized)
  const fetchPostData = useCallback(async () => {
    try {
      setDataLoading(true);

      // Lấy thông tin trụ sạc từ QR code
      const postInfo = await chargingStationService.getPostById(qrResult);
      setPostData(postInfo);

      // Lấy thông tin trạm sạc dựa vào ID trạm
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

      // Đặt dữ liệu mặc định khi có lỗi
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
  }, [qrResult]);

  // Lấy thông tin trụ sạc từ API khi mở modal
  useEffect(() => {
    if (isOpen && qrResult) {
      fetchPostData();
    }
  }, [isOpen, qrResult, fetchPostData]);

  // Tính toán expectedEndTime lần đầu khi modal mở
  useEffect(() => {
    if (isOpen && selectedChargingTime) {
      handleChargingTimeChange(selectedChargingTime);
    }
  }, [isOpen]); // Chỉ chạy khi modal mở

  // Xử lý khi người dùng click nút "Bắt đầu sạc" (memoized)
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

      // Sử dụng expectedEndTime đã tính toán từ slider
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
        message.success("Bắt đầu phiên sạc thành công!");

        if (response.data?.sessionId) {
          localStorage.setItem("currentSessionId", response.data.sessionId);
        }

        onClose();
        navigate("/app/energy");
      } else {
        // Hiển thị error message chi tiết
        const errorMsg = response.message || "Không thể bắt đầu phiên sạc";
        const errorStatus = response.errorDetails?.status;

        console.error("❌ Failed to create session:", {
          message: errorMsg,
          status: errorStatus,
          details: response.errorDetails,
        });

        // Hiển thị error message với status code nếu có
        if (errorStatus) {
          message.error(`${errorMsg} (Status: ${errorStatus})`);
        } else {
          message.error(errorMsg);
        }
      }
    } catch (error) {
      console.group("❌ Unexpected Error in handleStartCharging");
      console.error("Error:", error);
      console.error("Stack:", error.stack);
      console.groupEnd();

      message.error("Lỗi không xác định. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  }, [
    postData,
    user,
    fetchUserProfile,
    selectedChargingTime,
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
          zIndexPopupBase: 10010, // Đảm bảo popup Antd có z-index cao
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
            {/* Hiển thị loading spinner khi đang tải dữ liệu */}
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

                    {/* Hiển thị thời gian kết thúc dự kiến */}
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

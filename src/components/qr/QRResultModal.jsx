import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { message } from "antd";
import "../../assets/styles/QRResultModal.css";
import ElasticSlider from "./ElasticSlider";
import { BsBattery, BsLightning } from "react-icons/bs";
import { energySessionService } from "../../services/energySessionService";
import { getUserProfile } from "../../services/userService";

function QRResultModal({ isOpen, onClose, qrResult, stationData }) {
  const navigate = useNavigate();
  const [selectedBatteryLevel, setSelectedBatteryLevel] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Default values nếu không có data từ BE
  const chargingConfig = stationData?.chargingConfig || {
    minBatteryLevel: 20,
    maxBatteryLevel: 100,
    defaultBatteryLevel: 80,
    stepSize: 5,
  };

  const stationInfo = stationData?.stationInfo || {
    stationName: "Đang tải...",
    chargerName: "Trụ A1",
    chargerType: "AC 22kW",
    chargingStationId: null,
    chargingPostId: null,
  };

  // Xử lý khi click "Bắt đầu sạc"
  const handleStartCharging = async () => {
    try {
      setIsLoading(true);

      // Lấy thông tin user hiện tại
      const userProfile = await getUserProfile();
      const userId = userProfile?.userId || userProfile?.id;

      if (!userId) {
        message.error("Vui lòng đăng nhập để bắt đầu sạc");
        return;
      }

      // Chuẩn bị dữ liệu để tạo session
      const bookingData = {
        userId: userId,
        chargingStationId: stationInfo.chargingStationId || qrResult,
        chargingPostId: stationInfo.chargingPostId,
        targetBatteryLevel: selectedBatteryLevel,
        qrCode: qrResult,
        // Các thông tin bổ sung nếu cần
        startTime: new Date().toISOString(),
      };

      // Gọi API tạo phiên sạc
      const response = await energySessionService.createSession(bookingData);

      if (response.success) {
        message.success("Bắt đầu phiên sạc thành công!");
        
        // Lưu sessionId vào localStorage nếu cần
        localStorage.setItem("currentSessionId", response.data.sessionId);
        
        // Đóng modal và điều hướng đến EnergyPage
        onClose();
        navigate("/app/energy");
      } else {
        message.error(response.message || "Không thể bắt đầu phiên sạc");
      }
    } catch (error) {
      console.error("Error starting charging session:", error);
      message.error("Lỗi khi bắt đầu phiên sạc. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="qr-result-modal-overlay" onClick={onClose}>
      <div className="qr-result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-result-modal-header">
          <h3>Kết quả quét QR</h3>
          <button className="qr-result-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="qr-result-modal-content">
          <div className="qr-result-info">
            <h4>Thông tin trụ sạc</h4>
            <p>
              <strong>QR Code:</strong> {qrResult}
            </p>
            <p>
              <strong>Trạm:</strong> {stationInfo.stationName} -{" "}
              {stationInfo.chargerName}
            </p>
            <p>
              <strong>Loại:</strong> {stationInfo.chargerType}
            </p>
          </div>

          <div className="charging-controls">
            <h4>Điều khiển sạc pin</h4>
            <div className="slider-section">
              <label>Mức sạc pin (%)</label>
              <ElasticSlider
                defaultValue={chargingConfig.defaultBatteryLevel}
                startingValue={chargingConfig.minBatteryLevel}
                maxValue={chargingConfig.maxBatteryLevel}
                isStepped={true}
                stepSize={chargingConfig.stepSize}
                leftIcon={<BsBattery />}
                rightIcon={<BsLightning />}
                onValueChange={setSelectedBatteryLevel}
              />
            </div>
          </div>
        </div>

        <div className="qr-result-modal-footer">
          <button
            className="qr-result-btn qr-result-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Đóng
          </button>
          <button
            className="qr-result-btn qr-result-btn-primary"
            onClick={handleStartCharging}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Bắt đầu sạc"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QRResultModal;
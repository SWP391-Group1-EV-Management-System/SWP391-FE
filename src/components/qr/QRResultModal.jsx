import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import "../../assets/styles/QRResultModal.css";
import ElasticSlider from "./ElasticSlider";
import { BsBattery, BsLightning } from "react-icons/bs";

function QRResultModal({ isOpen, onClose, qrResult, stationData }) {
  const navigate = useNavigate();
  const [selectedBatteryLevel, setSelectedBatteryLevel] = useState(80);

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
  };

  // Xử lý khi click "Bắt đầu sạc"
  const handleStartCharging = () => {
    // Lưu thông tin session sạc vào localStorage hoặc context
    const chargingSession = {
      qrCode: qrResult,
      stationInfo,
      targetBatteryLevel: selectedBatteryLevel,
      startTime: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
    };

    localStorage.setItem(
      "currentChargingSession",
      JSON.stringify(chargingSession)
    );

    // Đóng modal và điều hướng đến EnergyPage
    onClose();
    navigate("/app/energy");
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
          >
            Đóng
          </button>
          <button
            className="qr-result-btn qr-result-btn-primary"
            onClick={handleStartCharging}
          >
            Bắt đầu sạc
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QRResultModal;

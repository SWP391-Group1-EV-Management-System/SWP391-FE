import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import ShowQR from "../components/virtualstation/ShowQR";
import ShowSession from "../components/virtualstation/ShowSession";
import "../assets/styles/virtualstation/VirtualStationPage.css";
import "../assets/styles/virtualstation/PlugInButton.css";
import logo from "../assets/images/logo.png";

function VirtualStationPage() {
  const [showQR, setShowQR] = useState(false);
  const [showSession, setShowSession] = useState(false);

  // Handler khi nhấn nút "CẮM SẠC"
  const handlePlugIn = () => {
    setShowQR(true);
  };

  // ✅ Lắng nghe event "chargingStarted" từ QRResultModal
  useEffect(() => {
    const handleChargingStarted = (event) => {
      console.log(
        "🔌 [VirtualStationPage] Charging started event received:",
        event.detail
      );
      // Chuyển từ ShowQR sang ShowSession
      setShowQR(false);
      setShowSession(true);
    };

    window.addEventListener("chargingStarted", handleChargingStarted);

    // Cleanup
    return () => {
      window.removeEventListener("chargingStarted", handleChargingStarted);
    };
  }, []);

  return (
    <>
      {!showQR && !showSession ? (
        // Bước 1: Hiển thị nút "CẮM SẠC" trước
        <div className="plugin-container">
          <div className="plugin-card">
            <img src={logo} alt="Eco-Z" />
            <h1 className="plugin-title">Sẵn sàng sạc</h1>
            <p className="plugin-description">
              Vui lòng cắm dây sạc vào xe trước khi tiếp tục
            </p>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={handlePlugIn}
              className="plugin-button"
            >
              CẮM SẠC
            </Button>
          </div>
        </div>
      ) : showQR && !showSession ? (
        // Bước 2: Sau khi nhấn nút, hiển thị QR code
        <ShowQR />
      ) : (
        // Bước 3: Sau khi quét QR và bắt đầu sạc, hiển thị Session
        <ShowSession />
      )}
    </>
  );
}

export default VirtualStationPage;

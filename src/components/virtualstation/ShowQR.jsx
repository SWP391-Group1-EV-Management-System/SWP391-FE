import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { PiChargingStation } from "react-icons/pi";
import "../../assets/styles/virtualstation/ShowQR.css";
// Trang hiển thị QR cho một trụ cụ thể.
export default function ShowQR() {
  const { postId } = useParams(); // Lấy postId từ URL
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    // Chỉ cần lấy postId từ URL và set qrData
    setQrData(postId || ""); // Nếu postId có, set nó vào qrData
  }, [postId]);

  return (
    <div className="show-qr">
      <div className="qr-wrapper" style={{ width: 420, height: 420 }}>
        <QRCodeSVG
          value={qrData}
          size={420}
          fgColor="#0b9459"
          bgColor="transparent"
        />

        <div className="qr-overlay-icon" aria-hidden>
          <PiChargingStation className="overlay-icon-svg" />
        </div>
      </div>
    </div>
  );
}

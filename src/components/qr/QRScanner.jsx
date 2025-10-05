import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserMultiFormatReader } from "@zxing/library";
import "../../assets/styles/QRScanner.css";

const QRScanner = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [codeReader, setCodeReader] = useState(null);
  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      startScanning(reader);
    } catch (err) {
      console.error("Lỗi khởi tạo scanner:", err);
      setError("Không thể truy cập camera");
    }
  };

  const startScanning = async (reader) => {
    try {
      setIsScanning(true);
      setError(null);

      reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            onScanSuccess(result.text);
            stopScanning();
          }
        }
      );
    } catch (err) {
      setError("Không thể bắt đầu quét QR code");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h3>Quét QR Code</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="qr-scanner-content">
          {error ? (
            <div className="qr-error">
              <p>{error}</p>
              <button onClick={initializeScanner}>Thử lại</button>
            </div>
          ) : (
            <>
              <div className="video-container">
                <video
                  ref={videoRef}
                  className="qr-video"
                  autoPlay
                  muted
                  playsInline
                />
                <div className="scan-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
              </div>

              <p className="scan-instruction">
                {isScanning
                  ? "Đang quét... Hãy đưa QR code vào khung hình"
                  : "Đang khởi động camera..."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRScanner;

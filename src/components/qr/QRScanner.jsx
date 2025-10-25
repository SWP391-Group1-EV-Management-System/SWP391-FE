import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserMultiFormatReader } from "@zxing/library";
import "../../assets/styles/QRScanner.css";

/**
 * Component QR Scanner để quét mã QR từ camera
 *
 * Props:
 * - onScanSuccess: Callback khi quét thành công QR code
 * - onClose: Callback khi đóng scanner
 * - isOpen: Trạng thái mở/đóng của scanner
 */
const QRScanner = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef(null); // Tham chiếu đến phần tử video
  const [isScanning, setIsScanning] = useState(false); // Trạng thái đang quét
  const [error, setError] = useState(null); // Lỗi khi quét
  const [codeReader, setCodeReader] = useState(null); // Instance của ZXing reader
  // Hook effect để khởi tạo hoặc dừng scanner khi component mount/unmount
  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    // Cleanup function - dừng scanner khi component unmount
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  // Khởi tạo QR scanner với ZXing library
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

  // Bắt đầu quét QR code từ camera
  const startScanning = async (reader) => {
    try {
      setIsScanning(true);
      setError(null);

      // Sử dụng camera mặc định để quét QR code
      reader.decodeFromVideoDevice(
        undefined, // Sử dụng camera mặc định
        videoRef.current, // Element video để hiển thị camera
        (result, error) => {
          if (result) {
            // Khi quét thành công, gọi callback và dừng scanner
            onScanSuccess(result.text);
            stopScanning();
          }
          // Bỏ qua lỗi decode vì ZXing sẽ liên tục thử decode
        }
      );
    } catch (err) {
      setError("Không thể bắt đầu quét QR code");
      setIsScanning(false);
    }
  };

  // Dừng quét và giải phóng tài nguyên camera
  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset(); // Giải phóng camera và dừng stream
    }
    setIsScanning(false);
  };

  // Xử lý khi người dùng đóng scanner
  const handleClose = () => {
    stopScanning();
    onClose();
  };

  // Không render gì nếu scanner không mở
  if (!isOpen) return null;

  return createPortal(
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        {/* Header với tiêu đề và nút đóng */}
        <div className="qr-scanner-header">
          <h3>Quét mã QR</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="qr-scanner-content">
          {/* Hiển thị lỗi nếu có */}
          {error ? (
            <div className="qr-error">
              <p>{error}</p>
              <button onClick={initializeScanner}>Thử lại</button>
            </div>
          ) : (
            <>
              {/* Container chứa video camera và khung quét */}
              <div className="video-container">
                <video
                  ref={videoRef}
                  className="qr-video"
                  autoPlay
                  muted
                  playsInline
                />
                {/* Khung hiển thị vùng quét QR */}
                <div className="scan-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
              </div>

              {/* Hướng dẫn sử dụng cho người dùng */}
              <p className="scan-instruction">
                {isScanning
                  ? "Đang quét... Hãy đưa mã QR vào khung hình"
                  : "Đang khởi động camera..."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body // Render modal vào document.body
  );
};

export default QRScanner;

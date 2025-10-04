import React, { useState } from "react";
import { FaSearch, FaRegBell, FaRegEnvelope } from "react-icons/fa";
import "../../assets/styles/MyNavbar.css";
import { BsQrCodeScan } from "react-icons/bs";
import QRScanner from "../qr/QRScanner";

function MyNavbar({ collapsed }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Function để giới hạn độ dài tên user
  const truncateUserName = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Có thể nhận userName từ props hoặc state trong tương lai
  const userName = "USER NAME"; // Placeholder, sau này sẽ đọc từ data

  // Xử lý khi click vào nút QR
  const handleQRClick = () => {
    setIsQRScannerOpen(true);
  };

  // Xử lý khi đóng QR Scanner
  const handleCloseQRScanner = () => {
    setIsQRScannerOpen(false);
  };

  // Xử lý khi quét QR thành công
  const handleScanSuccess = (result) => {
    console.log("QR Code được quét:", result);
    alert(`QR Code: ${result}`);
    setIsQRScannerOpen(false);
    // Thêm logic xử lý kết quả QR ở đây
  };

  return (
    <nav className={`top-navbar ${collapsed ? "collapsed" : ""}`}>
      <div className="navbar-content">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>

        {/* Right Side Icons */}
        <div className="navbar-right">
          <div
            className="icon-item"
            onClick={handleQRClick}
            style={{ cursor: "pointer" }}
          >
            <BsQrCodeScan className="nav-icon" />
          </div>
          <div className="icon-item">
            <FaRegBell className="nav-icon" />
          </div>
          <div className="icon-item">
            <FaRegEnvelope className="nav-icon" />
          </div>
          <div className="line"></div>
          <div className="user-profile">
            <span className="user-name" title={userName}>
              {truncateUserName(userName)}
            </span>
            <div className="user-avatar"></div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={handleCloseQRScanner}
        onScanSuccess={handleScanSuccess}
      />
    </nav>
  );
}

export default MyNavbar;

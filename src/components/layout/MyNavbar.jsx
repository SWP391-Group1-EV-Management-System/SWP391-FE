import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaRegBell, FaRegEnvelope } from "react-icons/fa";
import "../../assets/styles/MyNavbar.css";
import { BsQrCodeScan } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import QRScanner from "../qr/QRScanner";
import QRResultModal from "../qr/QRResultModal";

function MyNavbar({ collapsed }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isQRResultModalOpen, setIsQRResultModalOpen] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [stationData, setStationData] = useState(null);
  const dropdownRef = useRef(null);

  // Function để giới hạn độ dài tên user
  const truncateUserName = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const storedUser = localStorage.getItem("user");
  const userSession = storedUser ? JSON.parse(storedUser) : null;
  // Có thể nhận userName từ props hoặc state trong tương lai
  //const userName = `${userSession.firstName} ${userSession.lastName}`; // Placeholder, sau này sẽ đọc từ data

  // Kiểm tra null safety trước khi truy cập properties
  const userName =
    userSession && userSession.firstName
      ? `${userSession.firstName}`
      : "Guest User";

  // Xử lý khi click vào nút QR
  const handleQRClick = () => {
    setIsQRScannerOpen(true);
  };

  // Xử lý khi đóng QR Scanner
  const handleCloseQRScanner = () => {
    setIsQRScannerOpen(false);
  };

  // Xử lý khi quét QR thành công
  const handleScanSuccess = async (result) => {
    console.log("QR Code được quét:", result);
    setQrResult(result);
    setIsQRScannerOpen(false);

    // Gọi API để lấy thông tin trụ sạc từ QR code
    try {
      // TODO: Thay thế bằng API call thực tế
      // const response = await fetch(`/api/stations/qr/${result}`);
      // const data = await response.json();

      // Mock data để demo - thay thế bằng API call thực tế
      const mockStationData = {
        stationInfo: {
          stationName: "Vincom Center",
          chargerName: "Trụ A1",
          chargerType: "AC 22kW",
        },
        chargingConfig: {
          minBatteryLevel: 10,
          maxBatteryLevel: 95,
          defaultBatteryLevel: 80,
          stepSize: 5,
        },
      };

      setStationData(mockStationData);
      setIsQRResultModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trụ sạc:", error);
      // Hiển thị thông báo lỗi hoặc sử dụng giá trị mặc định
      setIsQRResultModalOpen(true);
    }
  };

  // Xử lý đóng QR Result Modal
  const handleCloseQRResultModal = () => {
    setIsQRResultModalOpen(false);
    setQrResult("");
    setStationData(null);
  };

  // Xử lý toggle dropdown user
  const handleUserClick = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Xử lý logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login"; // Hoặc sử dụng navigate từ react-router
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <div
            className="user-profile"
            onClick={handleUserClick}
            ref={dropdownRef}
          >
            <span className="user-name" title={userName}>
              {truncateUserName(userName)}
            </span>
            <div className="user-avatar"></div>

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={handleLogout}>
                  <TbLogout size={20} /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={handleCloseQRScanner}
        onScanSuccess={handleScanSuccess}
      />

      {/* QR Result Modal */}
      <QRResultModal
        isOpen={isQRResultModalOpen}
        onClose={handleCloseQRResultModal}
        qrResult={qrResult}
        stationData={stationData}
      />
    </nav>
  );
}

export default MyNavbar;

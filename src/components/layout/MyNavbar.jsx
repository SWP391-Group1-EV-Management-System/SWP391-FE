import React, { useState, useEffect, useRef } from "react";
import { FaRegBell, FaRegEnvelope } from "react-icons/fa";
import { BsQrCodeScan } from "react-icons/bs";
import { TbLogout, TbUser, TbSettings } from "react-icons/tb";
import QRScanner from "../qr/QRScanner";
import QRResultModal from "../qr/QRResultModal";
import "../../assets/styles/MyNavbar.css";
import useAuth from "../../hooks/useLogout";

function MyNavbar({ collapsed }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isQRResultModalOpen, setIsQRResultModalOpen] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [stationData, setStationData] = useState(null);
  const dropdownRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const userSession = storedUser ? JSON.parse(storedUser) : null;

  const userName =
    userSession && userSession.firstName
      ? `${userSession.firstName}`
      : "Guest User";

  const { logout } = useAuth();

  // Xử lý QR Scanner
  const handleQRClick = () => setIsQRScannerOpen(true);
  const handleCloseQRScanner = () => setIsQRScannerOpen(false);

  const handleScanSuccess = async (result) => {
    console.log("QR Code được quét:", result);
    setQrResult(result);
    setIsQRScannerOpen(false);

    try {
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
      setIsQRResultModalOpen(true);
    }
  };

  const handleCloseQRResultModal = () => {
    setIsQRResultModalOpen(false);
    setQrResult("");
    setStationData(null);
  };

  const handleUserClick = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleLogout = () => logout();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`top-navbar ${collapsed ? "collapsed" : ""}`}>
      <div className="navbar-content">
        {/* Left Side - QR and Icons */}
        <div className="navbar-left">
          <div
            className="icon-item qr-button"
            onClick={handleQRClick}
            title="Quét QR Code"
          >
            <BsQrCodeScan className="nav-icon" />
            <span className="btn-label">Quét mã</span>
          </div>
          <div className="icon-item" title="Thông báo">
            <FaRegBell className="nav-icon" />
          </div>
          <div className="icon-item" title="Tin nhắn">
            <FaRegEnvelope className="nav-icon" />
          </div>
        </div>

        {/* Right Side - User Profile */}
        <div className="navbar-right">
          <div className="line"></div>
          <div
            className="user-profile"
            onClick={handleUserClick}
            ref={dropdownRef}
          >
            <span className="user-name">{userName}</span>
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <TbUser size={18} />
                  <span>Tài khoản</span>
                </div>
                <div className="dropdown-item">
                  <TbSettings size={18} />
                  <span>Cài đặt</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <TbLogout size={18} />
                  <span>Đăng xuất</span>
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

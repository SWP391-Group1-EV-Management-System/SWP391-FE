// Import các thư viện React và component cần thiết
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
// Import các icon từ react-icons
import { FaRegBell, FaRegEnvelope } from "react-icons/fa";
import { BsQrCodeScan } from "react-icons/bs";
import { TbLogout, TbUser, TbSettings } from "react-icons/tb";
// Import các component con
import QRScanner from "../qr/QRScanner";
import QRResultModal from "../qr/QRResultModal";
// Import hook xác thực người dùng
import { useAuth } from "../../hooks/useAuth";
// Import file CSS
import "../../assets/styles/MyNavbar.css";

/**
 * Component thanh điều hướng phía trên
 * @param {boolean} collapsed - Trạng thái thu gọn của sidebar
 */
function MyNavbar({ collapsed }) {
  const navigate = useNavigate();
  // === Các state quản lý trạng thái modal và dropdown ===
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false); // Trạng thái mở/đóng modal quét QR
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // Trạng thái mở/đóng dropdown user
  const [isQRResultModalOpen, setIsQRResultModalOpen] = useState(false); // Trạng thái mở/đóng modal kết quả QR
  const [qrResult, setQrResult] = useState(""); // Kết quả quét QR code
  const [stationData, setStationData] = useState(null); // Dữ liệu trạm sạc
  const dropdownRef = useRef(null); // Ref để xử lý click outside dropdown

  // Lấy thông tin user và các hàm xác thực từ hook
  const { user, logout, loading } = useAuth();

  // Tên hiển thị của user (nếu có firstName thì hiển thị, không thì hiển thị "Guest User")
  const userName = user && user.firstName ? `${user.firstName}` : "Guest User";

  // === Các hàm xử lý QR Scanner ===

  /**
   * Mở modal quét QR code
   */
  const handleQRClick = () => setIsQRScannerOpen(true);

  /**
   * Đóng modal quét QR code
   */
  const handleCloseQRScanner = () => setIsQRScannerOpen(false);

  /**
   * Xử lý khi quét QR thành công
   * @param {string} result - Kết quả quét được từ QR code
   */
  const handleScanSuccess = async (result) => {
    console.log("QR Code được quét:", result);
    setQrResult(result); // Lưu kết quả QR
    setIsQRScannerOpen(false); // Đóng modal quét QR

    try {
      // Dữ liệu mẫu về trạm sạc (sau này sẽ thay thế bằng API thực)
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

      setStationData(mockStationData); // Lưu dữ liệu trạm sạc
      setIsQRResultModalOpen(true); // Mở modal hiển thị kết quả
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trụ sạc:", error);
      setIsQRResultModalOpen(true); // Vẫn mở modal dù có lỗi
    }
  };

  /**
   * Đóng modal kết quả QR và reset các state liên quan
   */
  const handleCloseQRResultModal = () => {
    setIsQRResultModalOpen(false);
    setQrResult(""); // Xóa kết quả QR
    setStationData(null); // Xóa dữ liệu trạm sạc
  };

  // === Các hàm xử lý user dropdown ===

  /**
   * Toggle trạng thái mở/đóng dropdown user
   */
  const handleUserClick = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  /**
   * Navigate đến trang user profile
   */
  const handleProfileClick = () => {
    setIsUserDropdownOpen(false);
    navigate("/app/profile");
  };

  /**
   * Xử lý đăng xuất người dùng
   * Gọi API logout và chuyển hướng về trang login
   */
  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false); // Đóng dropdown ngay lập tức để UX mượt mà
      await logout(); // Gọi API logout và xử lý cleanup (xóa token, user data)
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      // Vẫn redirect về login nếu có lỗi để đảm bảo user được đăng xuất
      window.location.href = "/welcome";
    }
  };

  // === Effect xử lý click outside để đóng dropdown ===
  useEffect(() => {
    /**
     * Xử lý sự kiện click bên ngoài dropdown để tự động đóng
     * @param {Event} event - Sự kiện click
     */
    const handleClickOutside = (event) => {
      // Nếu click bên ngoài dropdown thì đóng dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    // Thêm event listener khi component mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: Xóa event listener khi component unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Render giao diện ===
  return (
    <nav className={`top-navbar ${collapsed ? "collapsed" : ""}`}>
      <div className="navbar-content">
        {/* Phần bên trái - Nút QR và các icon chức năng */}
        <div className="navbar-left">
          {/* Nút quét QR Code */}
          <div
            className="icon-item qr-button"
            onClick={handleQRClick}
            title="Quét QR Code"
          >
            <BsQrCodeScan className="nav-icon" />
            <span className="btn-label">Quét mã</span>
          </div>

          {/* Icon thông báo */}
          <div className="icon-item" title="Thông báo">
            <FaRegBell className="nav-icon" />
          </div>

          {/* Icon tin nhắn */}
          <div className="icon-item" title="Tin nhắn">
            <FaRegEnvelope className="nav-icon" />
          </div>
        </div>

        {/* Phần bên phải - Thông tin user */}
        <div className="navbar-right">
          <div className="line"></div> {/* Đường phân cách */}
          {/* Profile user với dropdown */}
          <div
            className="user-profile"
            onClick={handleUserClick}
            ref={dropdownRef}
          >
            <span className="user-name">{userName}</span>

            {/* Avatar hiển thị chữ cái đầu của tên */}
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* Menu dropdown user (chỉ hiển thị khi isUserDropdownOpen = true) */}
            {isUserDropdownOpen && (
              <div className="user-dropdown">
                {/* Menu item: Tài khoản */}
                <div className="dropdown-item" onClick={handleProfileClick}>
                  <TbUser size={18} />
                  <span>Tài khoản</span>
                </div>

                {/* Menu item: Cài đặt */}
                <div className="dropdown-item">
                  <TbSettings size={18} />
                  <span>Cài đặt</span>
                </div>

                {/* Đường phân cách */}
                <div className="dropdown-divider"></div>

                {/* Menu item: Đăng xuất (có trạng thái loading) */}
                <div
                  className={`dropdown-item ${loading ? "loading" : ""}`}
                  onClick={handleLogout}
                  style={{ opacity: loading ? 0.6 : 1 }} // Làm mờ khi đang loading
                >
                  <TbLogout size={18} />
                  <span>{loading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal quét QR Code */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={handleCloseQRScanner}
        onScanSuccess={handleScanSuccess}
      />

      {/* Modal hiển thị kết quả QR */}
      <QRResultModal
        isOpen={isQRResultModalOpen}
        onClose={handleCloseQRResultModal}
        qrResult={qrResult}
        stationData={stationData}
      />
    </nav>
  );
}

// Export component để sử dụng ở nơi khác
export default MyNavbar;
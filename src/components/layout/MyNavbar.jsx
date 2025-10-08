import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaRegBell, FaRegEnvelope } from "react-icons/fa";
import "../../assets/styles/MyNavbar.css";
import { BsQrCodeScan } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import QRScanner from "../qr/QRScanner";

function MyNavbar({ collapsed }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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
  const handleScanSuccess = (result) => {
    console.log("QR Code được quét:", result);
    alert(`QR Code: ${result}`);
    setIsQRScannerOpen(false);
    // Thêm logic xử lý kết quả QR ở đây
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
    </nav>
  );
}

export default MyNavbar;

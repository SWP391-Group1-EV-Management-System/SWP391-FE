import React from "react";
import { FaSearch, FaRegBell, FaRegEnvelope } from "react-icons/fa";
import "../../assets/styles/MyNavbar.css";
import { BsQrCodeScan } from "react-icons/bs";

function MyNavbar({ collapsed }) {
  // Function để giới hạn độ dài tên user
  const truncateUserName = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };
  const storedUser = localStorage.getItem("user");
  const userSession = storedUser ? JSON.parse(storedUser) : null;
  // Có thể nhận userName từ props hoặc state trong tương lai
  const userName = `${userSession.firstName} ${userSession.lastName}`; // Placeholder, sau này sẽ đọc từ data
  return (
    <nav className={`top-navbar ${collapsed ? "collapsed" : ""}`}>
      <div className="navbar-content">
        {/* Search Bar */}
        <div className="search-container">
          <input type="text" placeholder="Tìm kiếm..." className="search-input" />
          <FaSearch className="search-icon" />
        </div>

        {/* Right Side Icons */}
        <div className="navbar-right">
          <div className="icon-item">
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
    </nav>
  );
}

export default MyNavbar;

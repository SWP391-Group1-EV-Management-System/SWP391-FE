/**
 * Menu.jsx - Component Sidebar Menu Responsive với phân quyền
 *
 * Component này tạo ra một sidebar menu responsive với các tính năng:
 * - Thu gọn/mở rộng sidebar
 * - Active indicator với animation
 * - Responsive design cho mobile/tablet/desktop
 * - Hover effects và focus management
 * - Bootstrap integration
 * - React Router integration
 * - Role-based menu items (Admin, Staff, Manager)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  BsClock,
  BsCCircle,
  BsCreditCard,
  BsGear,
  BsHouse,
  BsLightning,
  BsMap,
  BsBookmarkStar,
  BsPeopleFill,
  BsClipboardData,
  BsHourglassSplit,
} from "react-icons/bs";
import { MdMenuOpen, MdDashboard } from "react-icons/md";
import { Button } from "react-bootstrap";
import { useRole } from "../../hooks/useAuth"; // Import useRole hook
import Logo from "../../assets/images/logo.png";
import "../../assets/styles/Menu.css";

// Định nghĩa menu items cho từng role
const menuItemsByRole = {
  ADMIN: [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    { id: "evadmindashboard", label: "Dashboard", icon: MdDashboard, path: "/app/evadmindashboard" },
    { id: "usermanagement", label: "User Management", icon: BsPeopleFill, path: "/app/usermanagement" },
  ],
  STAFF: [
    { id: "sessionstaff", label: "Session Staff", icon: BsClipboardData, path: "/app/sessionstaff" },
    { id: "waitingstaff", label: "Waiting Staff", icon: BsHourglassSplit, path: "/app/waitingstaff" },
  ],
  MANAGER: [
    { id: "usermanagement", label: "User Manager", icon: BsPeopleFill, path: "/app/usermanagement" },
    { id: "evadmindashboard", label: "Dashboard", icon: MdDashboard, path: "/app/evadmindashboard" },
  ],
  DRIVER: [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    { id: "map", label: "Bản đồ trạm", icon: BsMap, path: "/app/map" },
    { id: "energy", label: "Phiên sạc", icon: BsLightning, path: "/app/energy" },
    { id: "history", label: "Lịch sử", icon: BsClock, path: "/app/history" },
    {
      id: "servicepackage",
      label: "Gói dịch vụ",
      icon: BsBookmarkStar,
      path: "/app/servicepackage",
    },
    { id: "setting", label: "Cài đặt", icon: BsGear, path: "/app/setting" },
  ],
};

const Menu = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole(); // Lấy role từ useRole hook

  // Xác định role hiện tại (nếu là array thì lấy phần tử đầu tiên, nếu không có thì mặc định DRIVER)
  const currentRole = Array.isArray(userRole) ? userRole[0] : userRole || 'DRIVER';
  
  // Lấy menu items dựa trên role
  const menuItems = menuItemsByRole[currentRole] || menuItemsByRole.DRIVER;

  // Tìm active menu item dựa trên current path
  const getActiveMenuIdFromPath = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find((item) => item.path === currentPath);
    return currentItem ? currentItem.id : menuItems[0]?.id || "home";
  };

  // State quản lý menu item hiện tại được chọn
  const [activeMenuItem, setActiveMenuItem] = useState(menuItems[0]?.id || "home");

  // State quản lý animation khi chuyển đổi active item
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Effect đồng bộ activeMenuItem với URL hiện tại
   */
  useEffect(() => {
    const newActiveId = getActiveMenuIdFromPath();
    setActiveMenuItem(newActiveId);
  }, [location.pathname]);

  /**
   * Effect xử lý responsive behavior
   * Tự động thu gọn sidebar khi màn hình nhỏ hơn 768px
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        onToggleCollapse(true);
      }
    };

    // Gọi ngay lập tức và thêm event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggleCollapse]);

  /**
   * Xử lý click vào menu item với React Router
   */
  const handleMenuItemClick = (id, path) => {
    // Không làm gì nếu đã active
    if (id === activeMenuItem) return;

    // Bắt đầu animation
    setIsAnimating(true);

    // Navigate đến route mới
    navigate(path);

    // Timing tối ưu cho animation (300ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  /**
   * Tìm index của menu item hiện tại trong mảng
   */
  const getActiveIndex = () =>
    menuItems.findIndex((item) => item.id === activeMenuItem);

  /**
   * Tính toán vị trí top cho active indicator
   */
  const getHighlightTop = () => {
    const index = getActiveIndex();
    if (index === -1) return 0;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Mobile: chiều cao menu item 40px + margin 4px = 44px, bắt đầu từ 12px
      return index * 44 + 12;
    } else {
      // Desktop: chiều cao menu item 48px + margin 4px = 52px, bắt đầu từ 12px
      return index * 52 + 12;
    }
  };

  return (
    /* Container chính của sidebar với navigation role */
    <nav
      className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar-inner">
        {/* Header chứa logo */}
        <header
          className={`sidebar-header${
            collapsed ? " sidebar-header-collapsed" : ""
          }`}
        >
          <img
            className={`sidebar-logo${
              collapsed ? " sidebar-logo-collapsed" : ""
            }`}
            alt="Eco-Z Logo"
            src={Logo}
            onClick={() => navigate(menuItems[0]?.path || "/app/home")}
            style={{ cursor: "pointer" }}
          />
        </header>

        {/* Nút toggle thu gọn/mở rộng sidebar */}
        <Button
          variant="light"
          className={`sidebar-toggle d-flex align-items-left justify-content-left${
            collapsed ? "" : " sidebar-toggle-open"
          }`}
          aria-label="Toggle sidebar"
          onClick={() => onToggleCollapse((prev) => !prev)}
          tabIndex="-1"
          onFocus={(e) => {
            e.preventDefault();
            e.target.blur();
          }}
        >
          <MdMenuOpen
            className={`sidebar-toggle-icon${
              collapsed ? "" : " sidebar-toggle-icon-open"
            }`}
            aria-hidden="true"
          />
        </Button>

        {/* Container chứa menu items và active indicators */}
        <div
          style={{
            position: "relative",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            paddingTop: "10px",
          }}
        >
          {/* Active indicator - thanh xanh 4px bên trái */}
          {getActiveIndex() !== -1 && (
            <div
              className={`sidebar-highlight${isAnimating ? " fade-out" : ""}`}
              style={{
                top: `${getHighlightTop()}px`,
              }}
            />
          )}

          {/* Active box - nền fade animation từ trái sang phải */}
          {getActiveIndex() !== -1 && (
            <div
              className={`sidebar-active-box${isAnimating ? " fade-out" : ""}`}
              style={{
                top: `${getHighlightTop()}px`,
              }}
            />
          )}

          {/* Danh sách menu items */}
          {menuItems.map((item, idx) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`sidebar-menu-item d-flex align-items-center${
                collapsed
                  ? " sidebar-menu-item-collapsed justify-content-center"
                  : " justify-content-start"
              }`}
              onClick={() => handleMenuItemClick(item.id, item.path)}
              aria-current={activeMenuItem === item.id ? "page" : undefined}
              tabIndex="-1"
            >
              <item.icon className="sidebar-menu-icon" aria-hidden="true" />
              {!collapsed && (
                <div className="sidebar-menu-label">{item.label}</div>
              )}
            </Button>
          ))}
        </div>

        {/* Footer chứa copyright */}
        <footer
          className={`sidebar-footer${
            collapsed ? " sidebar-footer-collapsed" : ""
          }`}
        >
          <BsCCircle
            className="sidebar-footer-icon"
            style={{ color: "#00000073" }}
            aria-hidden="true"
          />
          {!collapsed && (
            <div className="sidebar-footer-text">2025 Group 1 SE1818</div>
          )}
        </footer>
      </div>
    </nav>
  );
};

export default Menu;
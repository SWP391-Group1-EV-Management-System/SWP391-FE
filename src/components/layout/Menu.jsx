/**
 * Menu.jsx - Component Sidebar Menu với localStorage-based status
 *
 * THAY ĐỔI:
 * - Không còn gọi API GET /api/users/status/{userId}
 * - Đọc status trực tiếp từ localStorage (key: "driverStatus")
 * - Lắng nghe thay đổi localStorage để tự động cập nhật menu
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  BsClock,
  BsCCircle,
  BsGear,
  BsCreditCard,
  BsHouse,
  BsLightning,
  BsMap,
  BsBookmarkStar,
  BsPeopleFill,
  BsClipboardData,
  BsHourglassSplit,
  BsCalendar2Check,
} from "react-icons/bs";
import { MdMenuOpen, MdDashboard } from "react-icons/md";
import { Button } from "react-bootstrap";
import { useRole } from "../../hooks/useAuth";
import Logo from "../../assets/images/logo.png";
import "../../assets/styles/Menu.css";

// Định nghĩa menu items cho từng role (non-driver)
const menuItemsByRole = {
  ADMIN: [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    {
      id: "evadmindashboard",
      label: "Dashboard",
      icon: MdDashboard,
      path: "/app/evadmindashboard",
    },
    {
      id: "usermanagement",
      label: "User Management",
      icon: BsPeopleFill,
      path: "/app/usermanagement",
    },
  ],
  STAFF: [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    {
      id: "sessionstaff",
      label: "Session Staff",
      icon: BsClipboardData,
      path: "/app/sessionstaff",
    },
    {
      id: "waitingstaff",
      label: "Waiting Staff",
      icon: BsHourglassSplit,
      path: "/app/waitingstaff",
    },
  ],
  MANAGER: [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    {
      id: "usermanagement",
      label: "User Manager",
      icon: BsPeopleFill,
      path: "/app/usermanagement",
    },
    {
      id: "evadmindashboard",
      label: "Dashboard",
      icon: MdDashboard,
      path: "/app/evadmindashboard",
    },
  ],
};

// Định nghĩa menu items cho Driver theo trạng thái
const getDriverMenuItems = (status) => {
  const baseItems = [
    { id: "home", label: "Trang chủ", icon: BsHouse, path: "/app/home" },
    { id: "map", label: "Bản đồ trạm", icon: BsMap, path: "/app/map" },
  ];

  // Menu item động dựa trên status
  let statusMenuItem;
  switch (status?.toLowerCase()) {
    case "session":
      statusMenuItem = {
        id: "session",
        label: "Phiên sạc",
        icon: BsLightning,
        path: "/app/session",
      };
      break;
    case "waiting":
      statusMenuItem = {
        id: "waiting",
        label: "Hàng đợi",
        icon: BsHourglassSplit,
        path: "/app/waiting",
      };
      break;
    case "booking":
      statusMenuItem = {
        id: "booking",
        label: "Đặt chỗ",
        icon: BsCalendar2Check,
        path: "/app/booking",
      };
      break;
    default:
      // Mặc định không hiển thị status menu item
      statusMenuItem = null;
  }

  const endItems = [
    {
      id: "payment-history",
      label: "Thanh toán",
      icon: BsCreditCard,
      path: "/app/payment-history",
    },
    { id: "history", label: "Lịch sử", icon: BsClock, path: "/app/history" },
    {
      id: "servicepackage",
      label: "Gói dịch vụ",
      icon: BsBookmarkStar,
      path: "/app/servicepackage",
    },
    { id: "vehicleregistration", label: "Đăng ký xe", icon: BsGear, path: "/app/vehicleregistration" },
  ];

  // Chỉ thêm statusMenuItem nếu có status
  return statusMenuItem
    ? [...baseItems, statusMenuItem, ...endItems]
    : [...baseItems, ...endItems];
};

const Menu = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();

  // State quản lý driver status từ localStorage
  const [driverStatus, setDriverStatus] = useState(null);

  // Xác định role hiện tại
  const currentRole = Array.isArray(userRole)
    ? userRole[0]
    : userRole || "DRIVER";

  // Lấy menu items dựa trên role
  const menuItems =
    currentRole === "DRIVER"
      ? getDriverMenuItems(driverStatus)
      : menuItemsByRole[currentRole] || getDriverMenuItems(null);

  // ==================== EFFECT: ĐỌC STATUS TỪ LOCALSTORAGE ====================
  useEffect(() => {
    if (currentRole !== "DRIVER") {
      return;
    }

    // Đọc status từ localStorage
    const loadStatusFromLocalStorage = () => {
      try {
        const savedStatus = localStorage.getItem("driverStatus");
        if (savedStatus) {
          console.log("📦 Loaded status from localStorage:", savedStatus);
          setDriverStatus(savedStatus.toLowerCase());
        } else {
          console.log("📦 No status in localStorage");
          setDriverStatus(null);
        }
      } catch (error) {
        console.error("Error reading localStorage:", error);
        setDriverStatus(null);
      }
    };

    // Load ngay khi mount
    loadStatusFromLocalStorage();

    // Lắng nghe thay đổi từ cùng tab (custom event)
    const handleCustomEvent = (e) => {
      console.log("📦 Custom event received:", e.detail);
      const newStatus = e.detail?.status;
      setDriverStatus(newStatus ? newStatus.toLowerCase() : null);
    };

    // Lắng nghe thay đổi localStorage (từ tab khác)
    const handleStorageChange = (e) => {
      if (e.key === "driverStatus") {
        console.log("📦 localStorage changed:", e.newValue);
        setDriverStatus(e.newValue ? e.newValue.toLowerCase() : null);
      }
    };

    window.addEventListener("driverStatusChanged", handleCustomEvent);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("driverStatusChanged", handleCustomEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentRole]);

  // Tìm active menu item dựa trên current path
  const getActiveMenuIdFromPath = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find((item) => item.path === currentPath);
    return currentItem ? currentItem.id : menuItems[0]?.id || "home";
  };

  // State quản lý menu item hiện tại được chọn
  const [activeMenuItem, setActiveMenuItem] = useState(
    menuItems[0]?.id || "home"
  );

  // State quản lý animation khi chuyển đổi active item
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Effect đồng bộ activeMenuItem với URL hiện tại
   */
  useEffect(() => {
    const newActiveId = getActiveMenuIdFromPath();
    setActiveMenuItem(newActiveId);
  }, [location.pathname, menuItems]);

  /**
   * Effect xử lý responsive behavior
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        onToggleCollapse(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [onToggleCollapse]);

  /**
   * Xử lý click vào menu item
   */
  const handleMenuItemClick = (id, path) => {
    if (id === activeMenuItem) return;

    setIsAnimating(true);
    navigate(path);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  /**
   * Tìm index của menu item hiện tại
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
      return index * 44 + 12;
    } else {
      return index * 52 + 12;
    }
  };

  return (
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

        {/* Nút toggle */}
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

        {/* Container chứa menu items */}
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
          {/* Active indicator */}
          {getActiveIndex() !== -1 && (
            <div
              className={`sidebar-highlight${isAnimating ? " fade-out" : ""}`}
              style={{
                top: `${getHighlightTop()}px`,
              }}
            />
          )}

          {/* Active box */}
          {getActiveIndex() !== -1 && (
            <div
              className={`sidebar-active-box${isAnimating ? " fade-out" : ""}`}
              style={{
                top: `${getHighlightTop()}px`,
              }}
            />
          )}

          {/* Danh sách menu items */}
          {menuItems.map((item) => (
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

        {/* Footer */}
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

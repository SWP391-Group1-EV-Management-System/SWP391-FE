/**
 * LOADING SPINNER COMPONENT
 *
 * Component loading có thể tái sử dụng cho toàn bộ ứng dụng
 *
 * Features:
 * - Nhiều kích thước khác nhau (small, medium, large)
 * - Nhiều kiểu hiển thị (spinner, dots, pulse)
 * - Có thể tùy chỉnh text và màu sắc
 * - Responsive design
 *
 * @component
 */

import React from "react";
import "./LoadingSpinner.css";

/**
 * LoadingSpinner Component
 *
 * @param {string} size - Kích thước: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} type - Kiểu hiển thị: 'spinner', 'dots', 'pulse' (default: 'spinner')
 * @param {string} text - Text hiển thị bên dưới spinner (optional)
 * @param {string} color - Màu sắc: 'primary', 'secondary', 'success', 'warning', 'danger' (default: 'primary')
 * @param {boolean} fullHeight - Có chiếm toàn bộ chiều cao container không (default: false)
 * @param {string} className - CSS class tùy chỉnh thêm
 */
const LoadingSpinner = ({
  size = "medium",
  type = "spinner",
  text = "",
  color = "primary",
  fullHeight = false,
  className = "",
}) => {
  // Tạo class names dựa trên props
  const containerClasses = [
    "loading-spinner-container",
    `loading-${size}`,
    `loading-${color}`,
    fullHeight ? "loading-full-height" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render các loại spinner khác nhau
  const renderSpinner = () => {
    switch (type) {
      case "dots":
        return (
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );

      case "pulse":
        return <div className="loading-pulse">⚡</div>;

      case "spinner":
      default:
        return (
          <div className="loading-spinner">
            <div className="spinner-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;

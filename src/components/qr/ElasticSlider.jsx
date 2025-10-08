/**
 * ElasticSlider Component
 *
 * Một slider tương tác với hiệu ứng elastic (đàn hồi) khi kéo ra ngoài giới hạn.
 * Sử dụng Framer Motion để tạo animation mượt mà và hiệu ứng vật lý.
 *
 * Features:
 * - Elastic overflow effect khi kéo ra ngoài
 * - Hover/Touch scale animation
 * - Stepped values (có thể nhảy theo bước)
 * - Custom icons cho left/right
 * - Callback khi giá trị thay đổi
 */

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RiVolumeDownFill, RiVolumeUpFill } from "react-icons/ri";

import "../../assets/styles/ElasticSlider.css";

// Giới hạn tối đa cho hiệu ứng overflow (pixel)
const MAX_OVERFLOW = 50;

/**
 * ElasticSlider - Main component
 * @param {number} defaultValue - Giá trị mặc định của slider (50)
 * @param {number} startingValue - Giá trị tối thiểu (0)
 * @param {number} maxValue - Giá trị tối đa (100)
 * @param {string} className - CSS class tùy chỉnh
 * @param {boolean} isStepped - Có nhảy theo bước hay không (false)
 * @param {number} stepSize - Kích thước bước nhảy (1)
 * @param {JSX.Element} leftIcon - Icon bên trái slider
 * @param {JSX.Element} rightIcon - Icon bên phải slider
 * @param {function} onValueChange - Callback khi giá trị thay đổi
 */
export default function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = "",
  isStepped = false,
  stepSize = 1,
  leftIcon = <RiVolumeDownFill />,
  rightIcon = <RiVolumeUpFill />,
  onValueChange = () => {},
}) {
  return (
    <div className={`slider-container ${className}`}>
      <Slider
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onValueChange={onValueChange}
      />
    </div>
  );
}

/**
 * Slider - Component chính chứa logic slider
 * Xử lý tất cả interaction, animation và tính toán giá trị
 */
function Slider({
  defaultValue,
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  onValueChange,
}) {
  // State lưu giá trị hiện tại của slider
  const [value, setValue] = useState(defaultValue);

  // Ref để truy cập DOM element của slider track
  const sliderRef = useRef(null);

  // State theo dõi vùng đang kéo: "left", "right", "middle"
  const [region, setRegion] = useState("middle");

  // Motion values để tracking mouse/touch position và animations
  const clientX = useMotionValue(0); // Vị trí X của cursor
  const overflow = useMotionValue(0); // Lượng overflow khi kéo ra ngoài
  const scale = useMotionValue(1); // Scale factor cho hover effect

  // Effect để cập nhật giá trị khi prop defaultValue thay đổi
  useEffect(() => {
    setValue(defaultValue);
    onValueChange(defaultValue);
  }, [defaultValue, onValueChange]);

  // Event listener để theo dõi vị trí cursor và tính toán overflow
  useMotionValueEvent(clientX, "change", (latest) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue;

      // Kiểm tra cursor có nằm ngoài slider track không
      if (latest < left) {
        setRegion("left"); // Kéo ra bên trái
        newValue = left - latest; // Tính khoảng cách overflow
      } else if (latest > right) {
        setRegion("right"); // Kéo ra bên phải
        newValue = latest - right; // Tính khoảng cách overflow
      } else {
        setRegion("middle"); // Trong vùng bình thường
        newValue = 0; // Không có overflow
      }

      // Áp dụng decay function để tạo hiệu ứng đàn hồi
      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  /**
   * Xử lý sự kiện di chuyển chuột/touch khi đang kéo slider
   */
  const handlePointerMove = (e) => {
    // Chỉ xử lý khi đang kéo (buttons > 0)
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();

      // Tính giá trị mới dựa trên vị trí cursor
      let newValue =
        startingValue +
        ((e.clientX - left) / width) * (maxValue - startingValue);

      // Nếu bật chế độ stepped, làm tròn theo stepSize
      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }

      // Giới hạn giá trị trong khoảng [startingValue, maxValue]
      newValue = Math.min(Math.max(newValue, startingValue), maxValue);

      // Cập nhật state và gọi callback
      setValue(newValue);
      onValueChange(newValue);

      // Cập nhật vị trí cursor cho overflow calculation
      clientX.jump(e.clientX);
    }
  };

  /**
   * Xử lý sự kiện bắt đầu kéo (mousedown/touchstart)
   */
  const handlePointerDown = (e) => {
    handlePointerMove(e); // Cập nhật giá trị ngay lập tức
    e.currentTarget.setPointerCapture(e.pointerId); // Capture pointer events
  };

  /**
   * Xử lý sự kiện kết thúc kéo (mouseup/touchend)
   * Animate overflow về 0 với spring animation
   */
  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  /**
   * Tính phần trăm để hiển thị slider range (thanh màu xanh)
   * @returns {number} Phần trăm từ 0-100
   */
  const getRangePercentage = () => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;

    return ((value - startingValue) / totalRange) * 100;
  };

  // Render slider UI
  return (
    <>
      {/* Container chính với hover/touch scale animation */}
      <motion.div
        onHoverStart={() => animate(scale, 1.2)} // Scale up khi hover
        onHoverEnd={() => animate(scale, 1)} // Scale về bình thường
        onTouchStart={() => animate(scale, 1.2)} // Scale up khi touch
        onTouchEnd={() => animate(scale, 1)} // Scale về bình thường
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.2], [0.7, 1]), // Fade in khi scale
        }}
        className="slider-wrapper"
      >
        {/* Left Icon với elastic animation */}
        <motion.div
          animate={{
            scale: region === "left" ? [1, 1.4, 1] : 1, // Pulse animation khi overflow left
            transition: { duration: 0.25 },
          }}
          style={{
            // Di chuyển icon theo overflow amount
            x: useTransform(() =>
              region === "left" ? -overflow.get() / scale.get() : 0
            ),
          }}
        >
          {leftIcon}
        </motion.div>

        {/* Slider Track - vùng chính để kéo */}
        <div
          ref={sliderRef}
          className="slider-root"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {/* Track wrapper với elastic deformation */}
          <motion.div
            style={{
              // Scale X để tạo hiệu ứng kéo dãn ngang
              scaleX: useTransform(() => {
                if (sliderRef.current) {
                  const { width } = sliderRef.current.getBoundingClientRect();
                  return 1 + overflow.get() / width;
                }
              }),
              // Scale Y để tạo hiệu ứng nén dọc khi overflow
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              // Transform origin thay đổi theo vị trí cursor
              transformOrigin: useTransform(() => {
                if (sliderRef.current) {
                  const { left, width } =
                    sliderRef.current.getBoundingClientRect();
                  return clientX.get() < left + width / 2 ? "right" : "left";
                }
              }),
              // Tăng height khi hover/touch
              height: useTransform(scale, [1, 1.2], [6, 12]),
              marginTop: useTransform(scale, [1, 1.2], [0, -3]),
              marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
            }}
            className="slider-track-wrapper"
          >
            <div className="slider-track">
              {/* Range indicator - thanh xanh hiển thị giá trị */}
              <div
                className="slider-range"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Icon với elastic animation */}
        <motion.div
          animate={{
            scale: region === "right" ? [1, 1.4, 1] : 1, // Pulse animation khi overflow right
            transition: { duration: 0.25 },
          }}
          style={{
            // Di chuyển icon theo overflow amount
            x: useTransform(() =>
              region === "right" ? overflow.get() / scale.get() : 0
            ),
          }}
        >
          {rightIcon}
        </motion.div>
      </motion.div>

      {/* Value indicator hiển thị giá trị hiện tại */}
      <p className="value-indicator">{Math.round(value)}</p>
    </>
  );
}

/**
 * Decay function - Tạo hiệu ứng đàn hồi cho overflow
 *
 * Sử dụng hàm sigmoid để tạo curve resistance:
 * - Khi kéo nhẹ: dễ dàng di chuyển
 * - Khi kéo mạnh: ngày càng khó khăn (như lò xo)
 *
 * @param {number} value - Khoảng cách overflow (pixel)
 * @param {number} max - Giá trị overflow tối đa
 * @returns {number} Giá trị sau khi áp dụng decay
 */
function decay(value, max) {
  if (max === 0) {
    return 0;
  }

  // Normalize value to 0-1 range
  const entry = value / max;

  // Apply sigmoid function: f(x) = 2 * (sigmoid(x) - 0.5)
  // Tạo curve từ 0 đến 1 với resistance tăng dần
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

  // Scale back to original range
  return sigmoid * max;
}

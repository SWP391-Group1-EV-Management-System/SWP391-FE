/**
 * ENERGY STATS COMPONENT
 *
 * Component hiển thị các thống kê năng lượng và thời gian của phiên sạc
 * Bao gồm 2 thẻ chính:
 * 1. Năng lượng đã sạc (kWh) - Giá trị tĩnh từ backend
 * 2. Thời gian đã sạc - Cập nhật realtime mỗi giây
 */

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { ThunderboltOutlined, ClockCircleOutlined } from "@ant-design/icons";

/**
 * Component chính hiển thị các thông số năng lượng/thời gian của phiên sạc
 * Layout: 2 cột responsive
 * - Mobile (xs): 24/24 - mỗi card chiếm full width
 * - Tablet (sm): 12/24 - mỗi card chiếm 50% width
 * - Desktop (md+): 12/24 - mỗi card chiếm 50% width
 */
const EnergyStats = ({ sessionData }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Gutter: khoảng cách giữa các cột là 16px (horizontal và vertical) */}

      {/* ==================== CARD 1: NĂNG LƯỢNG ĐÃ SẠC ==================== */}
      <Col xs={24} sm={12} md={12}>
        {/* Responsive columns:
            - xs={24}: Mobile - chiếm full width (24/24 columns)
            - sm={12}: Tablet - chiếm 50% width (12/24 columns)
            - md={12}: Desktop - chiếm 50% width (12/24 columns)
        */}
        <Card
          style={{
            borderRadius: "16px", // Bo tròn góc card
            border: "1px solid #e5e7eb", // Viền xám nhạt
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)", // Shadow nhẹ để tạo độ nổi
            textAlign: "center", // Căn giữa nội dung
            height: "100%", // Chiều cao 100% để 2 cards có chiều cao bằng nhau
          }}
          styles={{
            body: { padding: "24px" }, // Padding bên trong card body
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {/* Space: component Ant Design để tạo khoảng cách đều giữa các elements
                - direction="vertical": xếp dọc
                - size="small": khoảng cách nhỏ giữa các item
                - width: 100% để các item bên trong chiếm full width
            */}

            {/* Icon sét (⚡) - biểu tượng cho năng lượng/điện */}
            <ThunderboltOutlined
              style={{
                fontSize: "32px", // Kích thước icon lớn
                color: "#10b981", // Màu xanh lá (emerald-500)
                marginBottom: "8px", // Khoảng cách với phần dưới
              }}
            />

            {/* Statistic component của Ant Design để hiển thị số liệu
                - title: nhãn "Năng lượng đã sạc"
                - value: giá trị từ sessionData.energyCharged
                - suffix: đơn vị "kWh" hiển thị sau số
                - valueStyle: custom style cho số (to, đậm, màu đen)
            */}
            <Statistic
              title="Năng lượng đã sạc"
              value={sessionData.energyCharged} // Lấy từ backend, ví dụ: "15.5" hoặc "0"
              suffix="kWh" // Đơn vị kilowatt-giờ
              valueStyle={{
                fontSize: "36px", // Số rất lớn để dễ đọc
                fontWeight: 700, // Font đậm (bold)
                color: "#1a1a1a", // Màu đen gần như thuần
              }}
            />
          </Space>
        </Card>
      </Col>

      {/* ==================== CARD 2: THỜI GIAN ĐÃ SẠC ==================== */}
      <Col xs={24} sm={12} md={12}>
        {/* Cấu trúc responsive giống Card 1 */}
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            height: "100%",
          }}
          styles={{
            body: { padding: "24px" },
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {/* Icon đồng hồ (🕐) - biểu tượng cho thời gian */}
            <ClockCircleOutlined
              style={{
                fontSize: "32px",
                color: "#10b981", // Cùng màu với card năng lượng để đồng bộ
                marginBottom: "8px",
              }}
            />

            {/* Component con để xử lý hiển thị thời gian realtime
                - Tách ra component riêng vì logic phức tạp (có timer)
                - Component này sẽ tự động cập nhật mỗi giây
            */}
            <RealtimeElapsedTime sessionData={sessionData} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default EnergyStats;

/**
 * REALTIME ELAPSED TIME COMPONENT
 *
 * Component con hiển thị thời gian đã sạc với cập nhật realtime
 * Logic hoạt động:
 * 1. Nếu có startTime: Tự động tính toán thời gian từ startTime đến hiện tại (hoặc endTime)
 * 2. Nếu không có startTime: Dùng giá trị timeElapsed từ backend (static value)
 * 3. Cập nhật mỗi giây bằng setInterval
 *
 * Xử lý edge cases:
 * - Phiên sạc đã kết thúc (có endTime): tính từ startTime đến endTime
 * - Phiên sạc đang chạy (không có endTime): tính từ startTime đến hiện tại
 * - Không có startTime: hiển thị giá trị fallback từ backend
 * - Component unmount: cleanup interval để tránh memory leak
 */
const RealtimeElapsedTime = ({ sessionData }) => {
  /**
   * State: display
   * - Lưu chuỗi thời gian để hiển thị (format: "MM:SS" hoặc "HH:MM:SS")
   * - Khởi tạo từ sessionData.timeElapsed nếu có, không thì "00:00"
   * - useState với function initializer để chỉ chạy 1 lần khi mount
   */
  const [display, setDisplay] = useState(
    () => sessionData.timeElapsed || "00:00"
  );

  useEffect(() => {
    /**
     * Flag mounted
     * - Dùng để kiểm tra component còn mounted hay không
     * - Tránh warning "Can't perform a React state update on an unmounted component"
     * - Khi component unmount, set mounted = false để không setState nữa
     */
    let mounted = true;

    /**
     * Format số giây thành chuỗi thời gian
     * Logic:
     * - Tính hours = totalSec / 3600 (1 giờ = 3600 giây)
     * - Tính minutes = (totalSec % 3600) / 60 (phần dư sau khi lấy giờ, chia cho 60)
     * - Tính seconds = totalSec % 60 (phần dư sau khi lấy phút)
     * - Nếu có giờ: return "HH:MM:SS"
     * - Nếu không có giờ: return "MM:SS"
     * - padStart(2, "0"): thêm số 0 đằng trước nếu chỉ có 1 chữ số (ví dụ: 5 -> "05")
     */
    function formatDurationSeconds(totalSec) {
      const hours = Math.floor(totalSec / 3600); // Làm tròn xuống để lấy số giờ nguyên
      const minutes = Math.floor((totalSec % 3600) / 60); // Lấy phần dư giờ, chia 60 để ra phút
      const seconds = Math.floor(totalSec % 60); // Lấy phần dư phút để ra giây

      if (hours > 0) {
        // Trường hợp có giờ: format "HH:MM:SS"
        // Note: Có \n trong string nhưng ngay sau đó replace thành "" (có thể là code cũ)
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`;
      }

      // Trường hợp không có giờ: chỉ format "MM:SS"
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }

    /**
     * Function update - Tính toán và cập nhật thời gian hiển thị
     * Được gọi:
     * 1. Ngay lập tức khi component mount
     * 2. Mỗi giây bởi setInterval
     *
     * Flow:
     * 1. Parse startTime và endTime từ sessionData
     * 2. Nếu không có startTime -> dùng fallback timeElapsed
     * 3. Nếu có startTime -> tính diff giữa (endTime hoặc now) và startTime
     * 4. Format diff thành chuỗi và setState
     */
    function update() {
      try {
        // Parse startTime từ string ISO sang Date object
        // Ví dụ: "2025-10-27T10:30:00Z" -> Date object
        const start = sessionData?.startTime
          ? new Date(sessionData.startTime)
          : null;

        // Parse endTime nếu có (phiên sạc đã kết thúc)
        const end = sessionData?.endTime ? new Date(sessionData.endTime) : null;

        // Trường hợp không có startTime
        if (!start) {
          // Dùng giá trị timeElapsed đã được backend tính sẵn
          // Hoặc "00:00" nếu cả timeElapsed cũng không có
          setDisplay(sessionData.timeElapsed || "00:00");
          return;
        }

        // Xác định thời điểm kết thúc để tính diff
        // - Nếu có endTime (phiên đã kết thúc): dùng endTime
        // - Nếu không có endTime (phiên đang chạy): dùng thời điểm hiện tại
        const now = end ? end : new Date();

        // Tính chênh lệch thời gian bằng milliseconds, sau đó chia 1000 để ra giây
        // getTime() trả về timestamp (milliseconds since 1970-01-01)
        // Math.max(0, ...) đảm bảo không bao giờ âm (trường hợp startTime > now)
        const diffSec = Math.max(
          0,
          Math.floor((now.getTime() - start.getTime()) / 1000)
        );

        // Format số giây thành chuỗi "MM:SS" hoặc "HH:MM:SS"
        const formatted = formatDurationSeconds(diffSec);

        // Chỉ setState khi component còn mounted
        // Tránh warning khi interval vẫn chạy sau khi component unmount
        if (mounted) setDisplay(formatted);
      } catch (e) {
        // Xử lý lỗi (ví dụ: startTime không đúng format, new Date() throw error)
        // Fallback về giá trị timeElapsed từ backend hoặc "00:00"
        if (mounted) setDisplay(sessionData.timeElapsed || "00:00");
      }
    }

    // Gọi update() ngay lần đầu tiên để không phải đợi 1 giây
    update();

    // Tạo interval để gọi update() mỗi 1000ms = 1 giây
    // Lưu interval ID để có thể clear khi cleanup
    const id = setInterval(update, 1000);

    /**
     * Cleanup function
     * - Được gọi khi:
     *   1. Component unmount
     *   2. Dependencies thay đổi (startTime, endTime, timeElapsed thay đổi)
     * - Set mounted = false để dừng setState
     * - clearInterval để dừng timer, tránh memory leak
     */
    return () => {
      mounted = false; // Đánh dấu component đã unmount
      clearInterval(id); // Hủy interval
    };
  }, [
    // Dependencies của useEffect
    // Khi bất kỳ giá trị nào trong mảng này thay đổi, effect sẽ chạy lại
    sessionData?.startTime, // Thời điểm bắt đầu thay đổi
    sessionData?.endTime, // Thời điểm kết thúc thay đổi (khi phiên kết thúc)
    sessionData?.timeElapsed, // Giá trị fallback thay đổi
  ]);

  /**
   * Render component
   * - Dùng Ant Design Statistic để hiển thị đồng bộ với Card "Năng lượng đã sạc"
   * - title: nhãn "Thời gian đã sạc"
   * - value: chuỗi thời gian từ state display (cập nhật mỗi giây)
   * - valueStyle: style giống hệt Card năng lượng để UI đồng nhất
   */
  return (
    <Statistic
      title="Thời gian đã sạc"
      value={display} // Giá trị động, cập nhật mỗi giây
      valueStyle={{
        fontSize: "36px", // Số to để dễ đọc
        fontWeight: 700, // Font đậm
        color: "#1a1a1a", // Màu đen
      }}
    />
  );
};

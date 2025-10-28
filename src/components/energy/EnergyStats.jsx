/**
 * ENERGY STATS COMPONENT
 *
 * Component hiển thị các thống kê năng lượng và thời gian của phiên sạc
 * Bao gồm 2 thẻ chính:
 * 1. Năng lượng đã sạc (kWh) - TÍNH REALTIME từ maxPower × thời gian
 * 2. Thời gian đã sạc - Cập nhật realtime mỗi giây
 */

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { ThunderboltOutlined, ClockCircleOutlined } from "@ant-design/icons";

/**
 * Component chính hiển thị các thông số năng lượng/thời gian của phiên sạc
 * Layout: 2 cột responsive
 */
const EnergyStats = ({ sessionData }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* ==================== CARD 1: NĂNG LƯỢNG ĐÃ SẠC ==================== */}
      <Col xs={24} sm={12} md={12}>
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
            <ThunderboltOutlined
              style={{
                fontSize: "32px",
                color: "#10b981",
                marginBottom: "8px",
              }}
            />

            {/* Component con để tính năng lượng realtime */}
            <RealtimeEnergyCharged sessionData={sessionData} />
          </Space>
        </Card>
      </Col>

      {/* ==================== CARD 2: THỜI GIAN ĐÃ SẠC ==================== */}
      <Col xs={24} sm={12} md={12}>
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
            <ClockCircleOutlined
              style={{
                fontSize: "32px",
                color: "#10b981",
                marginBottom: "8px",
              }}
            />
            <RealtimeElapsedTime sessionData={sessionData} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default EnergyStats;

/**
 * REALTIME ENERGY CHARGED COMPONENT
 *
 * Component mới để tính năng lượng đã sạc realtime
 * Công thức: energyCharged (kWh) = maxPower (kW) × timeElapsed (giờ)
 *
 * Logic:
 * 1. Tính thời gian đã sạc (giây) từ startTime đến hiện tại (hoặc endTime)
 * 2. Chuyển đổi giây sang giờ: hours = seconds / 3600
 * 3. Nhân với maxPower để ra kWh: energy = maxPower × hours
 * 4. Cập nhật mỗi giây để có giá trị realtime
 */
const RealtimeEnergyCharged = ({ sessionData }) => {
  const [displayEnergy, setDisplayEnergy] = useState(() => {
    // Khởi tạo từ energyCharged của backend nếu có
    return sessionData?.energyCharged != null
      ? Number(sessionData.energyCharged).toFixed(2)
      : "0.00";
  });

  useEffect(() => {
    let mounted = true;

    /**
     * Function tính năng lượng realtime
     *
     * Các trường hợp:
     * 1. Không có startTime -> dùng energyCharged từ backend (fallback)
     * 2. Không có maxPower -> không thể tính -> fallback
     * 3. Có đủ startTime + maxPower -> tính realtime
     */
    function calculateEnergy() {
      try {
        // Parse startTime và endTime
        const start = sessionData?.startTime
          ? new Date(sessionData.startTime)
          : null;
        const end = sessionData?.endTime ? new Date(sessionData.endTime) : null;

        // Lấy maxPower từ sessionData (đơn vị: kW)
        const maxPower = sessionData?.maxPower;

        // Fallback nếu không có dữ liệu cần thiết
        if (!start || !maxPower) {
          // Dùng giá trị từ backend nếu có
          const fallbackValue =
            sessionData?.energyCharged != null
              ? Number(sessionData.energyCharged).toFixed(2)
              : "0.00";

          if (mounted) setDisplayEnergy(fallbackValue);
          return;
        }

        // Xác định thời điểm kết thúc để tính
        // - Nếu có endTime (đã kết thúc): dùng endTime
        // - Nếu không (đang sạc): dùng thời điểm hiện tại
        // Respect a global paused marker (set when user clicked Stop) so stats
        // freeze while the confirmation modal is open.
        let now = end ? end : new Date();
        try {
          const pausedRaw = localStorage.getItem("currentSessionPausedAt");
          if (pausedRaw) {
            const parsed = JSON.parse(pausedRaw);
            if (
              parsed &&
              String(parsed.sessionId) ===
                String(sessionData?.chargingSessionId)
            ) {
              now = new Date(parsed.time);
            }
          }
        } catch (e) {
          // ignore parse errors
        }

        // Tính thời gian đã sạc (giây)
        const diffSeconds = Math.max(
          0,
          Math.floor((now.getTime() - start.getTime()) / 1000)
        );

        // Chuyển đổi giây sang giờ
        // 1 giờ = 3600 giây
        const hours = diffSeconds / 3600;

        // Tính năng lượng: energy (kWh) = power (kW) × time (h)
        const energyCharged = maxPower * hours;

        // Format: 2 chữ số thập phân
        const formattedEnergy = energyCharged.toFixed(2);

        // Cập nhật state nếu component còn mounted
        if (mounted) setDisplayEnergy(formattedEnergy);
      } catch (e) {
        console.error("Error calculating energy:", e);
        // Fallback khi có lỗi
        const fallbackValue =
          sessionData?.energyCharged != null
            ? Number(sessionData.energyCharged).toFixed(2)
            : "0.00";

        if (mounted) setDisplayEnergy(fallbackValue);
      }
    }

    // Tính ngay lần đầu
    calculateEnergy();

    // Tạo interval để cập nhật mỗi giây
    const intervalId = setInterval(calculateEnergy, 1000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [
    sessionData?.startTime,
    sessionData?.endTime,
    sessionData?.maxPower,
    sessionData?.energyCharged,
  ]);

  return (
    <Statistic
      title="Năng lượng đã sạc"
      value={displayEnergy}
      suffix="kWh"
      valueStyle={{
        fontSize: "36px",
        fontWeight: 700,
        color: "#1a1a1a",
      }}
    />
  );
};

/**
 * REALTIME ELAPSED TIME COMPONENT
 *
 * Component hiển thị thời gian đã sạc realtime (giữ nguyên logic cũ)
 */
const RealtimeElapsedTime = ({ sessionData }) => {
  const [display, setDisplay] = useState(
    () => sessionData?.timeElapsed || "00:00"
  );

  useEffect(() => {
    let mounted = true;

    function formatDurationSeconds(totalSec) {
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = Math.floor(totalSec % 60);

      if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`;
      }

      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }

    function update() {
      try {
        const start = sessionData?.startTime
          ? new Date(sessionData.startTime)
          : null;
        const end = sessionData?.endTime ? new Date(sessionData.endTime) : null;

        if (!start) {
          setDisplay(sessionData?.timeElapsed || "00:00");
          return;
        }

        let now = end ? end : new Date();
        try {
          const pausedRaw = localStorage.getItem("currentSessionPausedAt");
          if (pausedRaw) {
            const parsed = JSON.parse(pausedRaw);
            if (
              parsed &&
              String(parsed.sessionId) ===
                String(sessionData?.chargingSessionId)
            ) {
              now = new Date(parsed.time);
            }
          }
        } catch (e) {
          // ignore
        }
        const diffSec = Math.max(
          0,
          Math.floor((now.getTime() - start.getTime()) / 1000)
        );

        const formatted = formatDurationSeconds(diffSec);

        if (mounted) setDisplay(formatted);
      } catch (e) {
        if (mounted) setDisplay(sessionData?.timeElapsed || "00:00");
      }
    }

    update();
    const id = setInterval(update, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [sessionData?.startTime, sessionData?.endTime, sessionData?.timeElapsed]);

  return (
    <Statistic
      title="Thời gian đã sạc"
      value={display}
      valueStyle={{
        fontSize: "36px",
        fontWeight: 700,
        color: "#1a1a1a",
      }}
    />
  );
};

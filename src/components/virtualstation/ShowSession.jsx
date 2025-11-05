import React, { useState, useEffect } from "react";
import { Car, Zap, Clock, Battery } from "lucide-react";
import { useEnergySession } from "../../hooks/useEnergySession";
import usePublicSession from "../../hooks/usePublicSession";
import "./ShowSession.css";

/*
  Component: ShowSession
  - Hiển thị phiên sạc thời gian thực từ SessionPage
  - Đồng bộ dữ liệu với SessionPage qua useEnergySession
  - SSE real-time updates cho battery level, energy, time
  - Hỗ trợ 2 chế độ: authenticated (SessionPage) và public (VirtualStationPage)
  NOTE: Không import useAuth để tránh trigger getUserProfile khi public mode
*/
export default function ShowSession({
  sessionId: propSessionId,
  isPublic = false,
  userId = null, // ✅ Pass userId từ parent component khi authenticated
}) {
  // ✅ Chọn hook phù hợp dựa vào chế độ
  const { sessionData: authSessionData, isLoading: authLoading } =
    useEnergySession(isPublic ? null : userId);
  const {
    sessionData: publicSessionData,
    loading: publicLoading,
    batteryLevel: publicBatteryLevel,
    finishSession,
    finishLoading,
  } = usePublicSession(isPublic ? propSessionId : null);

  // Chọn dữ liệu phù hợp
  const sessionData = isPublic ? publicSessionData : authSessionData;
  const isLoading = isPublic ? publicLoading : authLoading;

  // ✅ Data đã được lấy từ usePublicSession SSE
  // sessionData đã chứa thông tin real-time từ SSE "chargingProgress":
  // - pin: % pin hiện tại
  // - targetPin: % pin mục tiêu
  // - secondRemaining: thời gian còn lại (giây)
  // - maxSeconds: tổng thời gian sạc (giây)
  // - chargedEnergy_kWh: năng lượng đã sạc
  // - elapsedSeconds: thời gian đã trôi qua

  // ✅ Tính toán giá trị hiển thị từ real data
  const battery = isPublic
    ? publicBatteryLevel || sessionData?.pin || sessionData?.batteryLevel || 0
    : sessionData?.batteryLevel || 0;

  const targetPin = sessionData?.targetPin || 100;
  const secondRemaining = sessionData?.secondRemaining || 0;
  const maxSeconds = sessionData?.maxSeconds || 0;

  // ✅ Debug logging
  useEffect(() => {
    if (isPublic) {
      console.log("🔍 [ShowSession] SSE Data:", {
        battery,
        targetPin,
        secondRemaining,
        maxSeconds,
        sessionData,
      });
    }
  }, [battery, targetPin, secondRemaining, maxSeconds, sessionData, isPublic]);

  const energy =
    parseFloat(
      (sessionData?.chargedEnergy_kWh || "0").toString().replace(",", ".")
    ) || 0;

  const power = sessionData?.maxPower || 7.2;

  // ✅ Backend trả về elapsedSeconds
  const elapsedSec = parseInt(sessionData?.elapsedSeconds || "0", 10);

  // Hàm tiện ích: chuyển seconds -> HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const elapsedTimeStr = formatTime(elapsedSec);

  // ✅ Tính thời gian còn lại từ SSE data
  const remainingTimeStr = formatTime(secondRemaining);
  const getRemainingMinutes = () => {
    return Math.ceil(secondRemaining / 60);
  };

  // Chọn lớp màu cho progress fill dựa trên mức pin (giống BatteryProgress)
  const getBatteryColorClass = () => {
    if (battery < 20) return "battery-red";
    if (battery < 50) return "battery-yellow";
    if (battery < 80) return "battery-blue";
    return "battery-green";
  };

  // ✅ Handler dừng sạc
  const handleStopCharging = async () => {
    if (!sessionData?.chargingSessionId && !propSessionId) {
      alert("Không tìm thấy phiên sạc");
      return;
    }

    const sessionId = sessionData?.chargingSessionId || propSessionId;
    const totalEnergy = energy || 0;

    // Confirm trước khi dừng
    const confirmed = window.confirm(
      `Bạn có chắc muốn dừng sạc?\n\nNăng lượng đã sạc: ${totalEnergy.toFixed(
        2
      )} kWh\nPin hiện tại: ${battery}%`
    );

    if (!confirmed) return;

    const result = await finishSession(sessionId, totalEnergy);

    if (result.success) {
      alert("✅ Đã dừng phiên sạc thành công!");
      // Reload hoặc navigate về trang chủ
      window.location.reload();
    } else {
      alert(`❌ Lỗi: ${result.message}`);
    }
  };

  // JSX UI: cấu trúc giao diện, giữ UI cũ nhưng dùng data từ hooks
  return (
    <div className="charging-container">
      <div className="charging-wrapper">
        <div className="charging-header">
          <div className="icon-circle">
            {/* Icon bấm mạnh để hiển thị trạng thái sạc */}
            <Zap color="white" size={40} />
          </div>
          <h1 className="charging-title">Đang Sạc</h1>
        </div>

        <div className="charging-card ">
          <div className="battery-display">
            <div className="car-icon-wrapper">
              {/* Hình xe minh hoạ */}
              <Car color="#10b981" size={120} />
            </div>

            {/* Phần hiển thị phần trăm pin lớn - ✅ Real data */}
            <div className="battery-percentage">{Math.round(battery)}%</div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getBatteryColorClass()}`}
                style={{ width: `${battery}%` }}
              ></div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card-show-session ">
              <div className="stat-header">
                <Clock size={20} color="#10b981" />
                <span>Thời gian</span>
              </div>
              {/* ✅ Real data from SSE - elapsedSeconds */}
              <div className="stat-value">{elapsedTimeStr}</div>
            </div>

            <div className="stat-card-show-session ">
              <div className="stat-header">
                <Zap size={20} color="#10b981" />
                <span>Công suất</span>
              </div>
              {/* ✅ Real data from sessionData */}
              <div className="stat-value">{power.toFixed(1)} kW</div>
            </div>

            <div className="stat-card-show-session ">
              <div className="stat-header">
                <Battery size={20} color="#10b981" />
                <span>Năng lượng</span>
              </div>
              {/* ✅ Real data from SSE - chargedEnergy_kWh */}
              <div className="stat-value">{energy.toFixed(2)} kWh</div>
            </div>

            <div className="stat-card-show-session ">
              <div className="stat-header">
                <Clock size={20} color="#10b981" />
                <span>Thời gian còn lại</span>
              </div>
              {/* ✅ Real data from SSE - secondRemaining */}
              <div className="stat-value">{remainingTimeStr}</div>
            </div>
          </div>

          <button
            className="stop-button"
            onClick={handleStopCharging}
            disabled={finishLoading}
          >
            {finishLoading ? "Đang dừng..." : "Dừng sạc"}
          </button>
        </div>
      </div>
    </div>
  );
}

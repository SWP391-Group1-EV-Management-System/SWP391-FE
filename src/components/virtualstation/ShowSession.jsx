import React, { useState, useEffect } from "react";
import { Car, Zap, Clock, Battery } from "lucide-react";
import "./ShowSession.css";

/*
  Component: ShowSession
  - Mô phỏng giao diện phiên sạc: hiển thị phần trăm pin, công suất, năng lượng, thời gian
  - Các state ở phía dưới mô phỏng dữ liệu thời gian thực (ví dụ khi kết nối với thiết bị hoặc server)
*/
export default function ShowSession() {
  // Trạng thái phần trăm pin (0-100)
  const [battery, setBattery] = useState(45);
  // Thời gian đã trôi qua (giây)
  const [elapsedTime, setElapsedTime] = useState(0);
  // Công suất hiện tại (kW) - mô phỏng
  const [power, setPower] = useState(7.2);
  // Tổng năng lượng nạp (kWh)
  const [energy, setEnergy] = useState(0);

  // Effect: timer mô phỏng dữ liệu thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      // Tăng dần phần trăm pin (giả lập sạc)
      setBattery((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });

      // Tăng thời gian đã trôi qua
      setElapsedTime((prev) => prev + 1);

      // Tính năng lượng nạp dựa trên công suất (kW -> kWh)
      setEnergy((prev) => prev + 7.2 / 3600);

      // Thay đổi nhỏ công suất để mô phỏng dao động
      setPower((prev) => {
        const variation = (Math.random() - 0.5) * 0.3;
        return Math.max(6.5, Math.min(7.5, prev + variation));
      });
    }, 1000);

    // Cleanup khi component unmount
    return () => clearInterval(timer);
  }, []);

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

  // Chọn lớp màu cho progress fill dựa trên mức pin
  const getBatteryColorClass = () => {
    if (battery < 20) return "battery-red";
    if (battery < 50) return "battery-yellow";
    if (battery < 80) return "battery-blue";
    return "battery-green";
  };

  // JSX UI: cấu trúc giao diện, sử dụng class CSS đã tách ra
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

        <div className="charging-card glass3d">
          <div className="battery-display">
            <div className="car-icon-wrapper">
              {/* Hình xe minh hoạ */}
              <Car color="#cbd5e1" size={120} />
              <div className="charging-badge">
                <Zap color="white" size={24} />
              </div>
            </div>

            {/* Phần hiển thị phần trăm pin lớn */}
            <div className="battery-percentage">{battery.toFixed(0)}%</div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getBatteryColorClass()}`}
                style={{ width: `${battery}%` }}
              ></div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card-show-session glass3d">
              <div className="stat-header">
                <Clock size={20} />
                <span>Thời gian</span>
              </div>
              <div className="stat-value">{formatTime(elapsedTime)}</div>
            </div>

            <div className="stat-card-show-session glass3d">
              <div className="stat-header">
                <Zap size={20} />
                <span>Công suất</span>
              </div>
              <div className="stat-value">{power.toFixed(1)} kW</div>
            </div>

            <div className="stat-card-show-session glass3d">
              <div className="stat-header">
                <Battery size={20} />
                <span>Năng lượng</span>
              </div>
              <div className="stat-value">{energy.toFixed(2)} kWh</div>
            </div>

            <div className="stat-card-show-session glass3d">
              <div className="stat-header">
                <Clock size={20} />
                <span>Thời gian còn lại</span>
              </div>
              <div className="stat-value">
                {Math.max(0, Math.ceil((100 - battery) / 0.5 / 60))} phút
              </div>
            </div>
          </div>

          <button className="stop-button">Dừng sạc</button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import "../../assets/styles/energy/CurrentTime.css";

const CurrentTime = ({ currentTime }) => {
  return (
    <div className="clock-container">
      <div className="clock-label">Thời gian hiện tại</div>
      <div className="clock-time">{currentTime.toLocaleTimeString()}</div>
      <div className="clock-date">
        {currentTime.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
};

export default CurrentTime;
import React from "react";
import { Card, Typography, Space, Tag, Progress, Button } from "antd";
import { ClockCircleOutlined, TeamOutlined, CarOutlined } from "@ant-design/icons";
import "../../assets/styles/WaitingQueue.css";

const { Title, Text } = Typography;

const WaitingQueue = ({
  queuePosition = 3,
  estimatedWaitTime = 45, // phút
  totalInQueue = 8,
  averageSessionTime = 30, // phút
  currentSessionRemaining = 15, // phút
  onCancel = null, // Callback khi hủy hàng chờ
}) => {
  // Tính toán thời gian ước tính
  const calculateEstimatedTime = () => {
    const currentSessionTime = currentSessionRemaining;
    const waitingTime = (queuePosition - 1) * averageSessionTime;
    return currentSessionTime + waitingTime;
  };

  // Format thời gian thành giờ:phút
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} phút`;
  };

  // Tính progress based on position
  const progressPercent = Math.round(((totalInQueue - queuePosition + 1) / totalInQueue) * 100);

  // Xác định màu sắc dựa trên thời gian chờ
  const getColorByWaitTime = () => {
    if (estimatedWaitTime <= 30) return "#52c41a"; // Xanh - ít chờ
    if (estimatedWaitTime <= 60) return "#faad14"; // Cam - chờ vừa
    return "#ff4d4f"; // Đỏ - chờ lâu
  };

  const estimatedTotal = calculateEstimatedTime();

  return (
    <Card className="waiting-queue-container">
      <div>
        {/* Header */}
        <div className="waiting-queue-header">
          <TeamOutlined className="waiting-queue-icon" />
          <Title level={4} className="waiting-queue-title">
            Hàng chờ
          </Title>
        </div>

        {/* Queue Position & Estimated Time */}
        <div className="queue-position-display">
          <div className="position-time-row">
            <div className="queue-number">
              #{queuePosition}
            </div>
            {queuePosition === 1 && (
              <div className="estimated-time-display">
                <Text className="time-value-large" style={{ color: getColorByWaitTime() }}>
                  {formatTime(estimatedTotal)}
                </Text>
                <Text className="time-label">
                  thời gian ước tính
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Time */}
        <div className="progress-container">
          <Progress
            percent={Math.round((currentSessionRemaining / (currentSessionRemaining + (queuePosition - 1) * averageSessionTime)) * 100)}
            strokeColor={getColorByWaitTime()}
            showInfo={false}
          />
        </div>

        {/* Nút điều khiển */}
        <div className="controls-container">
          <Button 
            danger
            type="primary"
            onClick={() => {
              if (onCancel) {
                onCancel();
              }
            }}
          >
            Hủy hàng chờ
          </Button>
        </div>

        {/* Tips */}
        <div className="queue-tips">
          <Text className="tips-text">
            💡 Thời gian ước tính có thể thay đổi tùy thuộc vào tình hình thực tế
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default WaitingQueue;
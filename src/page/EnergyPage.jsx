/**
 * ENERGY PAGE
 *
 * Trang hiển thị chi tiết phiên sạc đang diễn ra
 * Bao gồm:
 * - Thông tin trạm sạc (tên, địa chỉ, trạng thái)
 * - Pin level và thời gian còn lại
 * - Thống kê năng lượng và thời gian đã sạc
 * - Chi tiết kỹ thuật (socket type, power, voltage, current)
 * - Thông tin giá cả
 * - Xử lý các trường hợp: loading, error, 403 forbidden, không có session
 */

import React from "react";
import { Row, Col, Space, Spin, Alert, Button, Descriptions } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import WaitingQueue from "../components/energy/WaitingQueue";
import { useEnergySession } from "../hooks/useEnergySession";
import {
  ThunderboltOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import ArrivalTime from "../components/energy/ArrivalTime";
import { useAuth } from "../hooks/useAuth";

/**
 * Component chính của trang Energy
 * Flow hoạt động:
 * 1. Load thông tin user từ useAuth()
 * 2. Load thông tin phiên sạc từ useEnergySession()
 * 3. Kiểm tra các trạng thái: loading, error, forbidden, no session
 * 4. Nếu OK thì hiển thị UI chi tiết phiên sạc
 *
 * Security:
 * - Kiểm tra user có quyền xem session không (chủ session hoặc ADMIN/MANAGER)
 * - Xử lý 403 forbidden nếu không có quyền
 */
const EnergyPage = (userID) => {
  // Hook điều hướng để redirect sang các trang khác
  const navigate = useNavigate();

  /**
   * useEnergySession: Custom hook quản lý state của phiên sạc
   * Trả về:
   * - sessionData: dữ liệu chi tiết phiên sạc
   * - currentTime: thời gian hiện tại (cập nhật mỗi giây)
   * - statusConfig: cấu hình hiển thị status (color, icon, text, isCharging, isCompleted)
   * - isLoading: đang load dữ liệu
   * - error: lỗi message (nếu có)
   * - errorCode: HTTP status code của lỗi
   * - createSession: function tạo phiên sạc mới
   * - updateSessionStatus: function cập nhật trạng thái (pause/resume/stop)
   * - refetch: function gọi lại API để refresh data
   */
  const {
    sessionData,
    currentTime,
    statusConfig,
    isLoading,
    error,
    errorCode,
    createSession,
    updateSessionStatus,
    refetch,
  } = useEnergySession(userID);

  /**
   * useAuth: Custom hook quản lý authentication
   * Trả về:
   * - user: thông tin user đang đăng nhập {id, role, ...}
   * - loading: đang kiểm tra auth
   */
  const { user, loading: authLoading } = useAuth();

  // ==================== LOADING STATE ====================
  /**
   * Hiển thị spinner khi:
   * - Đang load session data (isLoading)
   * - Đang kiểm tra authentication (authLoading)
   *
   * UI: Full screen với spinner ở giữa màn hình
   */
  if (isLoading || authLoading) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white", // Background trắng
          minHeight: "100vh", // Full viewport height
          display: "flex",
          justifyContent: "center", // Căn giữa horizontal
          alignItems: "center", // Căn giữa vertical
        }}
      >
        <Spin
          size="large" // Spinner kích thước lớn
          spinning={true} // Luôn spinning
          tip="Đang tải thông tin phiên sạc..." // Text hiển thị dưới spinner
        >
          {/* Div rỗng với padding để tạo không gian cho spinner */}
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== FORBIDDEN STATE (403) ====================
  /**
   * Kiểm tra user có quyền truy cập session không
   *
   * Các trường hợp bị forbidden:
   * 1. User chưa đăng nhập (!user)
   * 2. User không phải chủ session (user.id !== sessionData.userId)
   *    VÀ không phải ADMIN/MANAGER
   * 3. API trả về errorCode 403
   *
   * Logic security:
   * - User thường chỉ xem được session của chính mình
   * - ADMIN/MANAGER có thể xem session của bất kỳ ai
   */
  const isForbidden =
    !user || // Chưa đăng nhập
    (sessionData &&
      user.id !== sessionData.userId && // Không phải chủ session
      user.role !== "ADMIN" && // Không phải admin
      user.role !== "MANAGER") || // Không phải manager
    errorCode === 403; // Hoặc backend trả về 403

  if (isForbidden) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          {/* Icon khóa màu đỏ */}
          <LockOutlined
            style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }}
          />

          {/* Alert thông báo không có quyền */}
          <Alert
            message="Không có quyền truy cập"
            description={
              <div>
                <p>Bạn không có quyền truy cập phiên sạc này.</p>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Phiên sạc này có thể thuộc về người dùng khác hoặc bạn không
                  có quyền xem.
                </p>
              </div>
            }
            type="error" // Alert màu đỏ
            showIcon={false} // Không hiển thị icon mặc định (đã có LockOutlined ở trên)
            style={{ marginBottom: "20px" }}
          />

          {/* Buttons hành động */}
          <Space>
            {/* Button về trang chủ */}
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => {
                // Xóa sessionId đã lưu trong localStorage (nếu có)
                localStorage.removeItem("currentSessionId");
                // Redirect về trang chủ
                navigate("/app/home");
              }}
            >
              Về trang chủ
            </Button>

            {/* Button thử lại */}
            <Button
              onClick={() => {
                // Xóa sessionId cũ và gọi lại API
                localStorage.removeItem("currentSessionId");
                refetch();
              }}
            >
              Thử lại
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  /**
   * Hiển thị lỗi chung (không phải 403)
   * Ví dụ: network error, 500 server error, timeout...
   */
  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Lỗi tải dữ liệu"
          description={
            <div>
              <p>{error}</p> {/* Hiển thị error message */}
              {errorCode && (
                // Hiển thị error code nếu có (nhỏ, màu xám)
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}
                >
                  Mã lỗi: {errorCode}
                </p>
              )}
            </div>
          }
          type="error" // Alert màu đỏ
          showIcon // Hiển thị icon error mặc định
          closable // Có thể đóng alert
          action={
            // Button thử lại ở góc phải alert
            <Button size="small" onClick={refetch}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // ==================== NO SESSION STATE ====================
  /**
   * Trường hợp không có phiên sạc nào đang hoạt động
   * User có thể:
   * 1. Tìm trạm sạc mới
   * 2. Tải lại để kiểm tra có session mới không
   */
  if (!sessionData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        <Alert
          message="Không có phiên sạc"
          description="Hiện tại không có phiên sạc nào đang hoạt động"
          type="info" // Alert màu xanh dương (thông tin)
          showIcon
          action={
            <Space>
              {/* Button đến trang map để tìm trạm sạc */}
              <Button size="small" onClick={() => navigate("/app/map")}>
                Tìm trạm sạc
              </Button>
              {/* Button reload */}
              <Button size="small" onClick={refetch}>
                Tải lại
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // ==================== MAIN CONTENT ====================
  /**
   * Hiển thị UI chi tiết phiên sạc khi có đầy đủ dữ liệu
   *
   * Layout structure:
   * 1. Header: Tên trạm, địa chỉ, status badge
   * 2. Quick summary: Tổng năng lượng đã sạc
   * 3. Row 1: Battery Progress + Current Time (2 cột)
   * 4. Energy Stats: Năng lượng + Thời gian (2 thẻ)
   * 5. Row 2: Technical Details + Pricing Info (2 cột)
   */
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      {/* Container với max-width để content không quá rộng trên màn hình lớn */}
      <div
        style={{
          maxWidth: "1400px", // Giới hạn width tối đa
          margin: "0 auto", // Căn giữa
        }}
      >
        {/* Space: tạo khoảng cách đều giữa các sections */}
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* ==================== HEADER SECTION ==================== */}
          {/**
           * PageHeader component hiển thị:
           * - Icon sét (ThunderboltOutlined)
           * - Tên trạm sạc
           * - Địa chỉ (subtitle)
           * - Status tag (màu sắc, icon, text theo trạng thái)
           */}
          <PageHeader
            title={sessionData.stationName || "Trạm sạc"} // Tên trạm, fallback "Trạm sạc"
            icon={<ThunderboltOutlined />} // Icon sét
            subtitle={sessionData.address || ""} // Địa chỉ, fallback rỗng
            statusTag={
              statusConfig
                ? {
                    color: statusConfig.color, // Màu tag (green/yellow/red/gray...)
                    icon: statusConfig.icon, // Icon trong tag
                    text: statusConfig.text, // Text hiển thị ("Đang sạc", "Hoàn thành"...)
                  }
                : null // Nếu không có statusConfig thì không hiển thị tag
            }
          />

          {/* ==================== QUICK SUMMARY ==================== */}
          {/**
           * Hiển thị tổng năng lượng đã sạc ngay dưới header
           * Format: "12.5 kWh" hoặc "15,500 kWh" (có dấu phẩy ngăn cách hàng nghìn)
           */}
          <Row>
            <Col>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Label màu xám */}
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  Tổng năng lượng
                </div>

                {/* Value màu xanh lá, to, đậm */}
                <div
                  style={{ color: "#0f766e", fontSize: 18, fontWeight: 700 }}
                >
                  {sessionData.energyCharged
                    ? isNaN(Number(sessionData.energyCharged))
                      ? sessionData.energyCharged // Nếu không parse được thành số, hiển thị nguyên bản
                      : `${Number(sessionData.energyCharged).toLocaleString(
                          "vi-VN"
                        )} kWh` // Format số với dấu phẩy VN + đơn vị
                    : "-"}{" "}
                  {/* Fallback nếu không có dữ liệu */}
                </div>
              </div>
            </Col>
          </Row>

          {/* ==================== ROW 1: BATTERY & TIME ==================== */}
          {/**
           * Gutter [16, 16]: khoảng cách giữa các cột
           * - [16, 16] = [horizontal, vertical]
           *
           * Responsive:
           * - xs={24}: Mobile - mỗi cột chiếm full width
           * - lg={12}: Desktop - mỗi cột chiếm 50% width
           */}
          <Row gutter={[16, 16]}>
            {/* Cột 1: Battery Progress */}
            <Col xs={24} lg={12}>
              {/**
               * Component hiển thị pin dạng circular progress
               * Props:
               * - batteryLevel: % pin hiện tại (0-100)
               * - isCharging: đang sạc hay không (để hiển thị animation)
               * - isCompleted: đã hoàn thành hay chưa (để đổi màu)
               */}
              <BatteryProgress
                batteryLevel={sessionData.batteryLevel || 0}
                isCharging={statusConfig?.isCharging || false}
                isCompleted={statusConfig?.isCompleted || false}
              />
            </Col>

            {/* Cột 2: Current Time / Expected End Time */}
            <Col xs={24} lg={12}>
              {/**
               * Component hiển thị thời gian còn lại hoặc giờ hiện tại
               * Props:
               * - currentTime: Date object
               *   + Nếu có expectedEndTime: hiển thị thời gian dự kiến kết thúc
               *   + Nếu không: hiển thị giờ hiện tại (realtime clock)
               */}
              <CurrentTime
                currentTime={
                  sessionData.expectedEndTime
                    ? new Date(sessionData.expectedEndTime) // Parse ISO string sang Date
                    : currentTime // currentTime từ hook (cập nhật mỗi giây)
                }
              />
            </Col>

            {/* ==================== COMMENTED ALTERNATIVES ==================== */}
            {/**
             * ArrivalTime Component (Cho booking flow)
             * Dùng khi user đã book trước và cần hiển thị:
             * - Thời gian đến dự kiến
             * - Countdown đến giờ booking
             * - Buttons: Start session, End session, Cancel
             */}
            {/* <Col xs={24} lg={12}>
              <ArrivalTime
                bookingData={sessionData.bookingData}
                onSessionCreate={(sessionInfo) => {
                  console.log("New session created:", sessionInfo);
                  // Callback khi tạo session thành công
                  // Có thể gọi refetch để cập nhật dữ liệu
                }}
                onSessionEnd={(sessionInfo) => {
                  console.log("Session ended:", sessionInfo);
                  // Callback khi kết thúc session
                  // Cập nhật trạng thái session
                  updateSessionStatus("stop");
                }}
                onTimeExpired={() => {
                  console.log("Session time expired");
                  // Callback khi hết thời gian booking
                  // Xử lý timeout
                }}
                onCancel={() => {
                  console.log("Booking cancelled");
                  // Callback khi hủy booking
                  // Xử lý hủy và navigate
                }}
              />
            </Col> */}

            {/**
             * WaitingQueue Component (Cho waiting list flow)
             * Dùng khi user đang trong hàng chờ, hiển thị:
             * - Vị trí trong hàng chờ (ví dụ: #3/8)
             * - Thời gian chờ dự kiến
             * - Tổng số người trong queue
             * - Thời gian session trung bình
             * - Thời gian còn lại của session hiện tại
             * - Button hủy hàng chờ
             */}
            {/* <Col xs={24} lg={12}>
              <WaitingQueue
                queuePosition={1} // Vị trí trong queue (số thứ tự)
                estimatedWaitTime={45} // Thời gian chờ dự kiến (phút)
                totalInQueue={8} // Tổng số người trong queue
                averageSessionTime={30} // Thời gian session trung bình (phút)
                currentSessionRemaining={15} // Thời gian còn lại của session hiện tại (phút)
                onCancel={() => {
                  console.log("Queue cancelled");
                  // Xử lý khi user hủy hàng chờ
                  // Gọi API cancel và navigate về map
                }}
              />
            </Col> */}
          </Row>

          {/* ==================== ENERGY STATS ==================== */}
          {/**
           * Component hiển thị 2 thẻ thống kê:
           * 1. Năng lượng đã sạc (kWh) - static value
           * 2. Thời gian đã sạc (MM:SS hoặc HH:MM:SS) - realtime countdown
           *
           * Chi tiết đã comment trong file EnergyStats.jsx
           */}
          <EnergyStats sessionData={sessionData} />

          {/* ==================== ROW 2: TECHNICAL & PRICING ==================== */}
          {/**
           * 2 cột thông tin bổ sung:
           * 1. Chi tiết kỹ thuật (Technical Details)
           * 2. Thông tin giá cả (Pricing Info)
           *
           * Cũng responsive giống Row 1
           */}
          <Row gutter={[16, 16]}>
            {/* Cột 1: Chi tiết kỹ thuật */}
            <Col xs={24} lg={12}>
              {/**
               * TechnicalDetails Component hiển thị:
               * - Loại cổng sạc (Socket Type): Type 2, CCS, CHAdeMO...
               * - Công suất (Power): 50kW, 150kW...
               * - Điện áp (Voltage): 400V...
               * - Dòng điện (Current): 125A...
               */}
              <TechnicalDetails sessionData={sessionData} />
            </Col>

            {/* Cột 2: Thông tin giá cả */}
            <Col xs={24} lg={12}>
              {/**
               * PricingInfo Component hiển thị:
               * - Chi phí dự kiến/tổng chi phí
               * - Giá theo kWh (nếu có)
               * - Giá theo phút (nếu có)
               * - Có thể có breakdown chi tiết
               */}
              <PricingInfo sessionData={sessionData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;

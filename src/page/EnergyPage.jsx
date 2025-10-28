/**
 * ENERGY PAGE (v2 - Optimized)
 *
 * Trang hiển thị chi tiết phiên sạc với chức năng dừng sạc
 * Sử dụng finishSession từ hook, không qua service
 */

import React, { useEffect } from "react";
import { Row, Col, Space, Spin, Alert, Button } from "antd";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BatteryProgress from "../components/energy/BatteryProgress";
import CurrentTime from "../components/energy/CurrentTime";
import EnergyStats from "../components/energy/EnergyStats";
import TechnicalDetails from "../components/energy/TechnicalDetails";
import PricingInfo from "../components/energy/PricingInfo";
import { useEnergySession } from "../hooks/useEnergySession";
import { useAuth } from "../hooks/useAuth";
import {
  ThunderboltOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const EnergyPage = ({ userID }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const {
    sessionData,
    currentTime,
    statusConfig,
    isLoading,
    isFinishing,
    error,
    errorCode,
    finishSession, // Hook method để kết thúc phiên sạc
    refetch,
  } = useEnergySession(userID);

  /**
   * Navigate đến payment page sau khi session kết thúc
   */
  useEffect(() => {
    // Chỉ navigate khi session đã done và không còn data
    if (!isLoading && !sessionData && !error) {
      console.log("Session đã kết thúc, chuyển đến trang payment");
      // Có thể navigate đến payment page hoặc home
      // navigate("/app/payment");
    }
  }, [sessionData, isLoading, error]);

  // ==================== LOADING STATE ====================
  if (isLoading || authLoading) {
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
        <Spin
          size="large"
          spinning={true}
          tip="Đang tải thông tin phiên sạc..."
        >
          <div style={{ padding: "50px" }} />
        </Spin>
      </div>
    );
  }

  // ==================== FORBIDDEN STATE (403) ====================
  const isForbidden =
    !user ||
    (sessionData &&
      user.id !== sessionData.userId &&
      user.role !== "ADMIN" &&
      user.role !== "MANAGER") ||
    errorCode === 403;

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
          <LockOutlined
            style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "20px" }}
          />
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
            type="error"
            showIcon={false}
            style={{ marginBottom: "20px" }}
          />
          <Space>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => {
                localStorage.removeItem("currentSessionId");
                navigate("/app/home");
              }}
            >
              Về trang chủ
            </Button>
            <Button
              onClick={() => {
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
              <p>{error}</p>
              {errorCode && (
                <p
                  style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}
                >
                  Mã lỗi: {errorCode}
                </p>
              )}
            </div>
          }
          type="error"
          showIcon
          closable
          action={
            <Button size="small" onClick={refetch}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // ==================== NO SESSION STATE ====================
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
          type="info"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={() => navigate("/app/map")}>
                Tìm trạm sạc
              </Button>
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
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <PageHeader
            title={sessionData.stationName || "Trạm sạc"}
            icon={<ThunderboltOutlined />}
            subtitle={sessionData.address || ""}
            statusTag={
              statusConfig
                ? {
                    color: statusConfig.color,
                    icon: statusConfig.icon,
                    text: statusConfig.text,
                  }
                : null
            }
          />

          {/* Quick Summary */}
          <Row>
            <Col>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  Tổng năng lượng
                </div>
                <div
                  style={{ color: "#0f766e", fontSize: 18, fontWeight: 700 }}
                >
                  {sessionData.energyCharged
                    ? isNaN(Number(sessionData.energyCharged))
                      ? sessionData.energyCharged
                      : `${Number(sessionData.energyCharged).toLocaleString(
                          "vi-VN"
                        )} kWh`
                    : "-"}
                </div>
              </div>
            </Col>
          </Row>

          {/* Row 1: Battery & Current Time */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BatteryProgress
                batteryLevel={sessionData.batteryLevel || 0}
                isCharging={statusConfig?.isCharging || false}
                isCompleted={statusConfig?.isCompleted || false}
              />
            </Col>

            <Col xs={24} lg={12}>
              {/* Truyền finishSession từ hook vào CurrentTime */}
              <CurrentTime
                currentTime={
                  sessionData.expectedEndTime
                    ? new Date(sessionData.expectedEndTime)
                    : currentTime
                }
                sessionData={sessionData}
                finishSession={finishSession} // Hook method
                isFinishing={isFinishing} // Loading state
              />
            </Col>
          </Row>

          {/* Energy Stats */}
          <EnergyStats sessionData={sessionData} />

          {/* Row 2: Technical Details & Pricing */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <TechnicalDetails sessionData={sessionData} />
            </Col>

            <Col xs={24} lg={12}>
              <PricingInfo sessionData={sessionData} />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default EnergyPage;

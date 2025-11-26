// Trang kết quả thanh toán - hiển thị kết quả sau khi thanh toán qua MoMo
import React, { useEffect, useState } from "react";
import { Result, Button, Spin, Card } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const PaymentReturn = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({});

  // Xử lý kết quả thanh toán từ URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get("resultCode");
    const orderId = urlParams.get("orderId");
    const amount = urlParams.get("amount");
    const orderInfo = urlParams.get("orderInfo");
    const message = urlParams.get("message");

    setPaymentInfo({
      orderId,
      amount,
      orderInfo,
      message,
    });

    // Kiểm tra thanh toán thành công (resultCode === "0")
    if (resultCode === "0") {
      setPaymentStatus("success");

      // Xử lý thanh toán đang chờ từ localStorage
      const pendingPaymentStr = localStorage.getItem("pendingPayment");

      if (pendingPaymentStr) {
        try {
          const pendingPayment = JSON.parse(pendingPaymentStr);
          const { sessionId } = pendingPayment;

          if (sessionId) {
            // Lưu vào danh sách phiên đã thanh toán
            const paidSessions = JSON.parse(
              localStorage.getItem("paidSessions") || "{}"
            );
            paidSessions[sessionId] = {
              paidAt: new Date().toISOString(),
              timestamp: Date.now(),
              orderId,
              amount,
            };
            localStorage.setItem("paidSessions", JSON.stringify(paidSessions));

            // Dispatch event để thông báo thanh toán thành công
            window.dispatchEvent(
              new CustomEvent("paymentSuccess", {
                detail: { sessionId, orderId, amount },
              })
            );
          }
        } catch (e) {
          console.error("Error parsing pending payment:", e);
        }
      }
    } else {
      setPaymentStatus("failed");
    }

    setLoading(false);
  }, []);

  // Điều hướng về trang chủ
  const handleBackToHome = () => {
    window.location.href = "/app/home";
  };

  // Hiển thị loading khi đang xử lý
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Kiểm tra loại thanh toán (gói dịch vụ hay phiên sạc)
  const isPackagePayment = paymentInfo.orderId?.startsWith("PKG_");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Card style={{ maxWidth: 600, width: "100%" }}>
        {/* Hiển thị kết quả thanh toán thành công */}
        {paymentStatus === "success" ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            status="success"
            title={
              isPackagePayment
                ? "Đăng ký gói dịch vụ thành công!"
                : "Thanh toán thành công!"
            }
            subTitle={
              <div>
                <p>
                  Mã đơn hàng: <strong>{paymentInfo.orderId}</strong>
                </p>
                <p>
                  Số tiền:{" "}
                  <strong>
                    {parseInt(paymentInfo.amount || 0).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </strong>
                </p>
                {paymentInfo.orderInfo && <p>{paymentInfo.orderInfo}</p>}
                {isPackagePayment && (
                  <p style={{ color: "#52c41a", marginTop: 12 }}>
                    Gói dịch vụ của bạn đã được kích hoạt!
                  </p>
                )}
              </div>
            }
            extra={[
              <Button type="primary" key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
            ]}
          />
        ) : (
          /* Hiển thị kết quả thanh toán thất bại */
          <Result
            icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            status="error"
            title={
              isPackagePayment
                ? "Đăng ký gói dịch vụ thất bại"
                : "Thanh toán thất bại"
            }
            subTitle={
              <div>
                <p>
                  Mã đơn hàng: <strong>{paymentInfo.orderId}</strong>
                </p>
                <p style={{ color: "#ff4d4f" }}>
                  {paymentInfo.message ||
                    "Giao dịch không thành công. Vui lòng thử lại!"}
                </p>
              </div>
            }
            extra={[
              <Button key="home" onClick={handleBackToHome}>
                Về trang chủ
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentReturn;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Layout, notification, Spin } from "antd";
import PaymentCard from "../components/payment/PaymentCard";
import ConfirmPaymentModal from "../components/payment/ConfirmPaymentModal";
import { usePaymentData, usePayment } from "../hooks/usePayment";

const { Content } = Layout;

// Component: Trang thanh toán cho phiên sạc
function PaymentPage() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const { fetchPaymentById, loading: fetchLoading } = usePaymentData();
  const {
    createMomoPayment,
    processPayment,
    loading: actionLoading,
  } = usePayment();

  const [paymentVisible, setPaymentVisible] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Chức năng: Tải thông tin thanh toán từ API
  useEffect(() => {
    if (!paymentId) return;

    fetchPaymentById(paymentId)
      .then((data) => {
        const mappedSessionData = {
          stationName: data.chargingStationName || "Trạm sạc",
          sessionId: data.sessionId || "N/A",
          energyConsumed: data.kwh || 0,
          basePrice: data.price || 0,
          paymentId: data.paymentId || paymentId,
          paid: data.paid || false,
          paymentMethod: data.paymentMethod || null,
        };
        setSessionData(mappedSessionData);
      })
      .catch((err) => {
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể tải thông tin thanh toán.",
        });
        setTimeout(() => navigate("/app/payment-history"), 2000);
      });
  }, [paymentId, fetchPaymentById, navigate]);

  useEffect(() => {
    // Xử lý callback khi user quay lại từ MoMo
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get("resultCode");

    if (!resultCode) return;

    const pendingPayment = localStorage.getItem("pendingPayment");

    if (resultCode === "0") {
      notification.success({ message: "Thanh toán thành công!" });
      if (pendingPayment) {
        localStorage.removeItem("pendingPayment");
      }
      // điều hướng hoặc refresh dữ liệu
      setTimeout(() => navigate("/app/payment-history"), 800);
    } else {
      notification.info({ message: "Giao dịch MoMo đã bị hủy hoặc thất bại." });
      if (pendingPayment) {
        localStorage.removeItem("pendingPayment");
      }
      // Xóa query params để user có thể thử lại
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // Chức năng: Xử lý xác nhận phương thức thanh toán
  const handlePaymentConfirm = (data) => {
    setPaymentData(data);
    setPaymentVisible(false);
    setConfirmVisible(true);
  };

  // Chức năng: Xử lý xác nhận thanh toán cuối cùng
  const handleConfirmPayment = async () => {
    setConfirmVisible(false);
    try {
      if (paymentData?.paymentMethod === "momo") await handleMomoPayment();
      else if (paymentData?.paymentMethod === "package")
        await handlePackagePayment();
      else if (paymentData?.paymentMethod === "cash") await handleCashPayment();
    } catch (err) {
      notification.error({
        message: "Lỗi thanh toán",
        description:
          err.response?.data?.message ||
          err.message ||
          "Không thể xử lý thanh toán.",
      });
      setPaymentVisible(true);
    }
  };

  // Chức năng: Thanh toán bằng tiền mặt (gọi API để set paymentMethodId = PMT_CASH)
  const handleCashPayment = async () => {
    const paymentMethodId = "PMT_CASH";
    try {
      const result = await processPayment(paymentId, paymentMethodId);
      if (result === false) {
        // backend returned false meaning failure e.g., cannot set this method
        notification.error({ message: "Không thể chọn thanh toán tiền mặt" });
        setPaymentVisible(true);
        return;
      }

      // Success: backend should trigger websocket notify to staff. Show success and redirect to history
      notification.success({
        message:
          "Đã gửi yêu cầu thanh toán bằng tiền mặt. Vui lòng đến quầy để thanh toán.",
      });
      setTimeout(() => navigate("/app/payment-history"), 1200);
    } catch (err) {
      console.error("Error processing cash payment:", err);
      throw err;
    }
  };

  // Chức năng: Thanh toán qua MoMo
  const handleMomoPayment = async () => {
    const paymentMethodId = "PMT_MOMO";
    const processResult = await processPayment(paymentId, paymentMethodId);

    if (!processResult) {
      throw new Error("Không thể cập nhật phương thức thanh toán");
    }

    const orderId = `${paymentId}`;
    const amount = paymentData.totalAmount;
    const orderInfo = `Thanh toán phiên sạc - ${
      sessionData?.sessionId || paymentId
    }`;
    const momoResponse = await createMomoPayment(orderId, amount, orderInfo);

    if (momoResponse?.payUrl) {
      notification.success({ message: "Đang chuyển đến MoMo...", duration: 2 });
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          paymentId: orderId,
          amount,
          sessionId: sessionData?.sessionId,
          timestamp: Date.now(),
        })
      );
      setTimeout(() => (window.location.href = momoResponse.payUrl), 800);
    } else {
      throw new Error("Không nhận được URL thanh toán từ MoMo");
    }
  };

  // Chức năng: Thanh toán bằng gói dịch vụ
  const handlePackagePayment = async () => {
    const paymentMethodId = "PMT_PACKAGE";
    const response = await processPayment(paymentId, paymentMethodId);
    if (response === false) {
      notification.warning({ message: "Gói dịch vụ không đủ", duration: 5 });
      setPaymentVisible(true);
    } else {
      notification.success({
        message: "Thanh toán bằng gói thành công",
        duration: 2,
      });
      setTimeout(() => navigate("/app/payment-history"), 1000);
    }
  };

  // Chức năng: Đóng modal thanh toán và quay về lịch sử
  const handleClosePaymentCard = () => {
    setPaymentVisible(false);
    navigate("/app/payment-history");
  };

  // Hiển thị: Màn hình loading khi đang tải dữ liệu
  if (fetchLoading || !sessionData) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 12, color: "#555", fontSize: 14 }}>
              Đang tải thông tin thanh toán...
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  // Hiển thị: Giao diện thanh toán chính
  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "24px" }}>
        {/* Component: Card chọn phương thức thanh toán */}
        <PaymentCard
          visible={paymentVisible}
          onClose={handleClosePaymentCard}
          sessionData={sessionData}
          onConfirm={handlePaymentConfirm}
        />

        {/* Component: Modal xác nhận thanh toán */}
        <ConfirmPaymentModal
          visible={confirmVisible}
          onConfirm={handleConfirmPayment}
          onCancel={() => {
            setConfirmVisible(false);
            setPaymentVisible(true);
          }}
          totalAmount={paymentData ? paymentData.totalAmount : 0}
          paymentData={paymentData}
          loading={actionLoading}
        />
      </Content>
    </Layout>
  );
}

export default PaymentPage;

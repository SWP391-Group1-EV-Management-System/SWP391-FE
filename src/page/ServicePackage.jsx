import React, { useEffect, useMemo, useState } from "react";
import { Layout, Row, Col, Modal, Button, message, Spin, Alert } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import ServicePackageCard from "../components/service/ServicePackageCard";
import usePackage from "../hooks/usePackage";
import { usePayment } from "../hooks/usePayment";
import { usePaymentPackage } from "../hooks/usePaymentPackage";
import { usePackageTransaction } from "../hooks/usePackageTransaction";
import { useAuth } from "../hooks/useAuth";

const { Content } = Layout;

const ServicePackage = () => {
  const { packages = [], fetchAll, loading: packagesLoading } = usePackage();
  const { createMomoPayment, loading: paymentLoading } = usePayment();
  const { createPaymentPacket } = usePaymentPackage();
  const {
    activeTransaction,
    fetchUserTransactions,
    cancelTransaction,
    loading: transactionLoading,
  } = usePackageTransaction();
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Tải danh sách gói dịch vụ và giao dịch đang hoạt động
  useEffect(() => {
    fetchAll();
    if (user?.id) {
      fetchUserTransactions(user.id);
    }
  }, [fetchAll, fetchUserTransactions, user?.id]);

  // Xử lý callback từ MoMo sau khi thanh toán
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get("resultCode");

    if (resultCode === "0") {
      const pendingPayment = localStorage.getItem("pendingPayment");

      if (pendingPayment) {
        const payment = JSON.parse(pendingPayment);
        message.success(`Thanh toán gói ${payment.packageName} thành công!`);
        localStorage.removeItem("pendingPayment");

        // Tải lại giao dịch sau khi thanh toán thành công
        if (user?.id) {
          setTimeout(() => {
            fetchUserTransactions(user.id);
          }, 1000);
        }

        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (resultCode) {
      message.error("Thanh toán thất bại hoặc bị hủy!");
      localStorage.removeItem("pendingPayment");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user?.id, fetchUserTransactions]);

  // Dọn dẹp thanh toán đã hết hạn
  useEffect(() => {
    const pendingPayment = localStorage.getItem("pendingPayment");
    if (pendingPayment) {
      const payment = JSON.parse(pendingPayment);
      const TIMEOUT = 30 * 60 * 1000; // 30 phút
      if (Date.now() - payment.timestamp > TIMEOUT) {
        localStorage.removeItem("pendingPayment");
      }
    }
  }, []);

  // Xử lý khi người dùng nhấn đăng ký gói
  const handleSubscribeClick = (pkg) => {
    if (!user || !user.id) {
      message.error("Vui lòng đăng nhập để đăng ký gói dịch vụ!");
      return;
    }

    if (activeTransaction) {
      message.warning(
        "Bạn đang có gói dịch vụ đang hoạt động. Vui lòng đợi hết hạn để đăng ký gói mới!"
      );
      return;
    }

    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  // Xử lý xác nhận thanh toán
  const handleConfirmPayment = async () => {
    if (!selectedPackage) return;

    if (!user || !user.id) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    try {
      message.loading("Đang khởi tạo thanh toán...", 0);

      // Tạo phiên thanh toán gói
      const paymentPacketId = await createPaymentPacket(
        user.id,
        selectedPackage.packageId
      );

      if (!paymentPacketId) {
        message.destroy();
        message.error("Không thể tạo phiên thanh toán!");
        return;
      }

      // Tạo thanh toán MoMo
      const orderInfo = `Thanh toán gói: ${selectedPackage.packageName}`;
      const response = await createMomoPayment(
        paymentPacketId,
        selectedPackage.price,
        orderInfo
      );

      message.destroy();

      // Chuyển hướng đến trang thanh toán MoMo
      if (response && response.payUrl) {
        message.success("Đang chuyển đến trang thanh toán MoMo...");

        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            paymentId: paymentPacketId,
            packageId: selectedPackage.packageId,
            packageName: selectedPackage.packageName,
            amount: selectedPackage.price,
            timestamp: Date.now(),
            userId: user.id,
          })
        );

        setTimeout(() => {
          window.location.href = response.payUrl;
        }, 1000);

        setModalVisible(false);
      } else {
        message.error(
          response?.message || "Không thể tạo thanh toán. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.destroy();
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!"
      );
    }
  };

  // Lọc và sắp xếp danh sách gói
  const filteredAndSorted = useMemo(() => {
    return (packages || []).slice();
  }, [packages]);

  // Kiểm tra người dùng có gói đang hoạt động
  const hasActivePackage = !!activeTransaction;

  // Xử lý hủy gói
  const handleCancelPackage = () => {
    if (!activeTransaction) return;
    Modal.confirm({
      title: "Xác nhận hủy gói",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn hủy gói đang sử dụng? Sau khi hủy bạn có thể đăng ký gói khác.",
      okText: "Hủy gói",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          message.loading("Đang hủy gói...", 0);
          // Debug: log activeTransaction to inspect id fields
          console.debug("Cancelling activeTransaction:", activeTransaction);
          const txId =
            activeTransaction.packageTransactionId ||
            activeTransaction.id ||
            activeTransaction.transactionId;
          console.debug("Using txId for cancel:", txId);
          await cancelTransaction(txId);
          message.destroy();
          message.success("Hủy gói thành công");
          // local state updated by the hook; no immediate refetch to avoid triggering a GET that may return 403
        } catch (err) {
          message.destroy();
          // Prefer server message (string or {message}) when available
          const serverMsg =
            typeof err?.response?.data === "string"
              ? err.response.data
              : err?.response?.data?.message;

          message.error(serverMsg || err?.message || "Hủy gói thất bại");
        }
      },
    });
  };

  if (packagesLoading || transactionLoading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "White" }}>
        <Content
          style={{
            padding: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "White" }}>
      <Content style={{ padding: 20 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <PageHeader
            title="Các gói dịch vụ sạc điện"
            subtitle="Chọn gói phù hợp với nhu cầu của bạn"
          />

          {/* Hiển thị thông tin gói đang hoạt động */}
          {activeTransaction && (
            <Alert
              message={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleOutlined />
                  <span style={{ fontWeight: 600 }}>
                    Gói dịch vụ đang hoạt động
                  </span>
                </div>
              }
              description={
                <div>
                  <p style={{ marginBottom: 4 }}>
                    Bạn đang sử dụng gói{" "}
                    <strong>
                      {packages.find(
                        (p) =>
                          p.packageId === activeTransaction.servicePackageId
                      )?.packageName || "Không xác định"}
                    </strong>
                  </p>
                  <p style={{ marginBottom: 4 }}>
                    Hạn mức còn lại:{" "}
                    <strong>{activeTransaction.remainingQuota} kWh</strong>
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <Button
                      danger
                      onClick={handleCancelPackage}
                      loading={transactionLoading}
                    >
                      Hủy gói
                    </Button>
                  </div>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
            {filteredAndSorted.map((pkg) => {
              const isCurrentActive =
                activeTransaction?.servicePackageId ===
                (pkg.packageId || pkg.id);
              const isDisabled = hasActivePackage && !isCurrentActive;

              return (
                <Col xs={24} sm={12} md={8} key={pkg.packageId || pkg.id}>
                  <ServicePackageCard
                    packageId={pkg.packageId || pkg.id}
                    packageName={pkg.packageName}
                    description={pkg.description}
                    price={pkg.price}
                    billingCycle={pkg.billingCycle}
                    unit={pkg.unit}
                    quota={pkg.quota}
                    type={pkg.type}
                    isActive={isCurrentActive}
                    isDisabled={isDisabled}
                    onSubscribe={handleSubscribeClick}
                  />
                </Col>
              );
            })}
          </Row>

          {/* Modal xác nhận đăng ký gói */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <span>Xác nhận đăng ký gói</span>
              </div>
            }
            open={modalVisible}
            onCancel={() => !paymentLoading && setModalVisible(false)}
            footer={null}
            centered
            width={480}
            maskClosable={!paymentLoading}
          >
            {selectedPackage && (
              <div>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <p style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
                    {selectedPackage.packageName}
                  </p>
                  <p style={{ marginBottom: 12, color: "#666" }}>
                    {selectedPackage.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
                    <div>
                      <p style={{ color: "#666", marginBottom: 4 }}>Giá gói:</p>
                      <p
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#0bb46b",
                          margin: 0,
                        }}
                      >
                        {(selectedPackage.price || 0).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </p>
                    </div>

                    <div>
                      <p style={{ color: "#666", marginBottom: 4 }}>
                        Thời hạn:
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        {selectedPackage.billingCycle} tháng
                      </p>
                    </div>

                    <div>
                      <p style={{ color: "#666", marginBottom: 4 }}>Hạn mức:</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        {selectedPackage.quota ?? "Không giới hạn"}
                      </p>
                    </div>

                    <div>
                      <p style={{ color: "#666", marginBottom: 4 }}>Đơn vị:</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        {selectedPackage.unit}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff7e6",
                    border: "1px solid #ffd666",
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: "#ad6800" }}>
                    <ExclamationCircleOutlined style={{ marginRight: 6 }} />
                    Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất
                    giao dịch
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <Button
                    onClick={() => setModalVisible(false)}
                    disabled={paymentLoading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    loading={paymentLoading}
                    onClick={handleConfirmPayment}
                    style={{
                      background: "#0bb46b",
                      borderColor: "#0bb46b",
                    }}
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ServicePackage;

import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Space, Modal, message, Tag, Typography } from "antd";
import { DollarOutlined, CheckOutlined } from "@ant-design/icons";
import { getCashPaymentRequests, confirmCashPayment } from "../../services/staffPaymentService";
import { useAuth } from "../../hooks/useAuth";

const { Text } = Typography;

const StaffPayments = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Static fetch-only mode (no realtime websocket)
  // messages removed — we only fetch via API and use the Refresh button

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const resp = await getCashPaymentRequests(user.id);
      console.log("[StaffPayments] getCashPaymentRequests response:", resp);
      // helper to pick first defined value
      const firstDefined = (obj, ...keys) => {
        for (const k of keys) {
          if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return 0;
      };

      // normalize fields to expected table schema
      const normalized = (Array.isArray(resp) ? resp : []).map((item) => ({
        paymentId: item.paymentId || item.payment_id || item.id,
        sessionId: item.sessionId || item.session_id || item.sessionId || item.session?.sessionId,
        chargingStationName:
          item.chargingStationName ||
          item.charging_station_name ||
          item.stationName ||
          (item.chargingStation && item.chargingStation.name) ||
          "",
        // accept multiple possible keys for energy
        kWh: firstDefined(item, "kWh", "kwh", "energyCharged", "energyConsumed", "kwhConsumed", "energy"),
        price: item.price || item.totalPrice || item.amount || 0,
        paymentMethod: item.paymentMethod || item.method || item.paymentMethodName || "",
        isPaid: item.isPaid ?? item.paid ?? false,
      }));
      setData(normalized);
    } catch (err) {
      console.error("Error fetching cash payment requests:", err);
      // If the server returned 404/204 or no response body, treat as empty list
      const status = err?.response?.status;
      if (status === 404 || status === 204) {
        setData([]);
      } else {
        // Use a stable message key so repeated errors replace the same toast
        message.error({ content: "Không thể tải yêu cầu thanh toán", key: "staffPaymentsFetch", duration: 3 });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // No websocket handling — UI only supports manual refresh now

  const handleConfirm = async (paymentId) => {
    Modal.confirm({
      title: "Xác nhận thanh toán bằng tiền mặt",
      content: "Bạn có chắc chắn đã nhận tiền mặt từ driver?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await confirmCashPayment(paymentId);
          message.success("Đã xác nhận thanh toán");
          // Refresh the list after successful confirmation
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("Xác nhận thất bại");
        }
      },
    });
  };

  const columns = [
    { title: "Mã thanh toán", dataIndex: "paymentId", key: "paymentId" },
    { title: "Mã phiên", dataIndex: "sessionId", key: "sessionId" },
    {
      title: "Trạm",
      dataIndex: "chargingStationName",
      key: "chargingStationName",
      render: (t) => <Text>{t}</Text>,
    },
    {
      title: "kWh",
      key: "kWh",
      render: (_, record) => {
        const v = record.kWh ?? record.kwh ?? 0;
        return <Text>{Number(v).toLocaleString()} kWh</Text>;
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (p) => <Text>{p ? Number(p).toLocaleString() + " VND" : "0 VND"}</Text>,
    },
    { title: "Hình thức", dataIndex: "paymentMethod", key: "paymentMethod" },
    {
      title: "Trạng thái",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (paid) => (paid ? <Tag color="green">Đã thanh toán</Tag> : <Tag color="orange">Chưa</Tag>),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {!record.isPaid && (
            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleConfirm(record.paymentId)}>
              Xác nhận
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Button icon={<DollarOutlined />} onClick={fetchData} type="default">
          Làm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={(r) => r.paymentId}
        locale={{ emptyText: "Không có dữ liệu" }}
      />
    </div>
  );
};

export default StaffPayments;

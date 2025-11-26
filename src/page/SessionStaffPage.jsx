// Trang phiên sạc nhân viên - quản lý và dừng các phiên sạc tại trạm
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Card,
  Statistic,
  Badge,
  Typography,
  Row,
  Col,
  Input,
  Button,
  Modal,
  Popconfirm,
  message,
} from "antd";
import {
  SearchOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import StaffPayments from "../components/staff/StaffPayments";
import { useStaff } from "../hooks/useStaff";
import { useRole } from "../hooks/useAuth";
import api from "../utils/axios";
import "../assets/styles/SessionStaff.css";
import "../assets/styles/utilities.css";

const { Title } = Typography;
const { Search } = Input;

// Định nghĩa trạng thái phiên sạc
const SESSION_STATUS = {
  COMPLETED: true,
  PROCESSING: false,
};

const STATUS_CONFIG = {
  [SESSION_STATUS.COMPLETED]: { color: "success", text: "Hoàn thành" },
  [SESSION_STATUS.PROCESSING]: { color: "processing", text: "Đang sạc" },
};

// Format tiền tệ theo VND
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const SessionStaffPage = () => {
  const { userId } = useRole();
  const { dashboardInfo, sessions, loading, fetchSessions } = useStaff(userId);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [loadingIds, setLoadingIds] = useState([]); // IDs đang xử lý

  const addLoadingId = (id) => setLoadingIds((s) => (s.includes(id) ? s : [...s, id]));
  const removeLoadingId = (id) => setLoadingIds((s) => s.filter((x) => x !== id));

  // Dữ liệu thống kê dashboard
  const statsData = useMemo(() => {
    if (!dashboardInfo) return [];

    return [
      {
        title: "Tổng phiên sạc",
        value: dashboardInfo.totalSessionInStation || 0,
        icon: <ThunderboltOutlined />,
        color: "#43e97b",
      },
      {
        title: "Đang sạc",
        value: dashboardInfo.totalSessionIsProcessingInStation || 0,
        icon: <ClockCircleOutlined />,
        color: "#43e97b",
      },
      {
        title: "Hoàn thành",
        value: dashboardInfo.totalSessionCompletedInStation || 0,
        icon: <CheckOutlined />,
        color: "#43e97b",
      },
      {
        title: "Tổng doanh thu",
        value: dashboardInfo.totalRevenueInStation || 0,
        formatter: "currency",
        icon: <DollarOutlined />,
        color: "#43e97b",
      },
    ];
  }, [dashboardInfo]);

  // Dữ liệu bảng phiên sạc (sắp xếp mới nhất lên đầu)
  const tableData = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    // Sort sessions by startedTime descending so newest start time appears first
    const sorted = sessions.slice().sort((a, b) => {
      const ta = a.startedTime ? new Date(a.startedTime).getTime() : 0;
      const tb = b.startedTime ? new Date(b.startedTime).getTime() : 0;
      return tb - ta;
    });

    return sorted.map((session, index) => ({
      key: index + 1,
      sessionId: session.chargingSessionId,
      userDriver: session.userName || "N/A",
      post: session.postName || "N/A",
      date: session.dateCreated ? new Date(session.dateCreated).toLocaleDateString("vi-VN") : "N/A",
      status: session.status,
      startTime: session.startedTime ? new Date(session.startedTime).toLocaleTimeString("vi-VN") : "N/A",
      endTime: session.endedTime ? new Date(session.endedTime).toLocaleTimeString("vi-VN") : null,
      kwh: session.kwh || 0,
      totalAmount: session.totalAmount || 0,
    }));
  }, [sessions]);

  // Xử lý tìm kiếm phiên sạc
  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      if (!value) {
        setFilteredSessions(tableData);
      } else {
        const filtered = tableData.filter(
          (session) =>
            session.sessionId.toLowerCase().includes(value.toLowerCase()) ||
            session.userDriver.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSessions(filtered);
      }
    },
    [tableData]
  );

  useEffect(() => {
    setFilteredSessions(tableData);
  }, [tableData]);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  // Định nghĩa các cột của bảng
  const columns = useMemo(
    () => [
      {
        title: "Thao tác",
        dataIndex: "action",
        key: "action",
        fixed: "left",
        width: 120,
        render: (_, record) => {
          const isProcessing = record.status === false || record.status === "charging";

          // Xử lý dừng phiên sạc
          const handleStop = async (sessionId) => {
            try {
              addLoadingId(sessionId);
              // Send finish request with default energy 0 (backend expects BigDecimal body)
              await api.post(`/api/charging/session/finish/${sessionId}`, 0, {
                headers: { "Content-Type": "application/json" },
              });
              message.success("Đã gửi yêu cầu dừng sạc");
              // Refresh table data
              if (typeof fetchSessions === "function") fetchSessions();
            } catch (err) {
              console.error("Error stopping session:", err);
              message.error("Không thể dừng sạc, vui lòng thử lại");
            } finally {
              removeLoadingId(sessionId);
            }
          };

          return (
            <div style={{ display: "inline-flex", gap: 8 }}>
              {isProcessing ? (
                <Popconfirm
                  title="Bạn có chắc muốn dừng sạc phiên này?"
                  onConfirm={() => handleStop(record.sessionId)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button
                    size="small"
                    loading={loadingIds.includes(record.sessionId)}
                    style={{
                      background: "#ff4d4f",
                      borderColor: "#ff4d4f",
                      color: "#fff",
                    }}
                  >
                    Dừng sạc
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  size="small"
                  style={{
                    background: "#f5f5f5",
                    borderColor: "#f5f5f5",
                    color: "#999",
                  }}
                  disabled
                >
                  -
                </Button>
              )}
            </div>
          );
        },
      },
      {
        title: "Mã phiên",
        dataIndex: "sessionId",
        key: "sessionId",
        fixed: "left",
        width: 200,
        render: (text) => (
          <Typography.Text strong className="session-text-success">
            {text}
          </Typography.Text>
        ),
      },
      {
        title: "User Driver",
        dataIndex: "userDriver",
        key: "userDriver",
        width: 150,
        render: (text) => (
          <Space>
            <span>👤</span>
            <Typography.Text className="session-text-dark">{text}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạm",
        dataIndex: "post",
        key: "post",
        width: 150,
        render: (text) => <Tag color="green">{text}</Tag>,
      },
      {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
        width: 120,
        render: (text) => <Typography.Text className="session-text-dark">{text}</Typography.Text>,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 140,
        filters: [
          { text: "Đang sạc", value: false },
          { text: "Hoàn thành", value: true },
        ],
        onFilter: (value, record) => record.status === value,
        render: (status) => {
          const config = STATUS_CONFIG[status];
          return <Badge status={config?.color} text={config?.text} />;
        },
      },
      {
        title: "Giờ bắt đầu",
        dataIndex: "startTime",
        key: "startTime",
        width: 120,
        render: (time) => (
          <Space>
            <span>🕐</span>
            <Typography.Text className="session-text-dark">{time}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Giờ kết thúc",
        dataIndex: "endTime",
        key: "endTime",
        width: 120,
        render: (time) => (
          <Space>
            <span>🕐</span>
            <Typography.Text className="session-text-dark">
              {time || <span className="session-text-muted">--:--</span>}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "KWh",
        dataIndex: "kwh",
        key: "kwh",
        width: 100,
        sorter: (a, b) => a.kwh - b.kwh,
        render: (kwh) => (
          <Statistic
            value={kwh}
            suffix="kWh"
            valueStyle={{ fontSize: "14px" }}
            className="session-statistic-value-success"
            precision={2}
          />
        ),
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 130,
        sorter: (a, b) => a.totalAmount - b.totalAmount,
        render: (amount) => (
          <Typography.Text strong className="session-text-success">
            {formatCurrency(amount)}
          </Typography.Text>
        ),
      },
    ],
    [fetchSessions, loadingIds]
  );

  return (
    <div className="session-staff-page" style={{ background: "white" }}>
      <PageHeader
        title="Phiên sạc nhân viên"
        icon={<ThunderboltOutlined />}
        subtitle="Hệ thống quản lý trạm sạc xe điện thông minh, bền vững và thân thiện môi trường"
      />
      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="session-margin-bottom-32">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} lg={6} xl={6} key={index}>
            <Card hoverable className="session-stats-card" styles={{ body: { padding: "24px" } }} loading={loading}>
              <div className="session-text-center">
                <div className="session-margin-bottom-16">
                  <span className="session-text-large session-text-gray">{stat.icon}</span>
                </div>

                <Typography.Text className="session-stats-card-title">{stat.title}</Typography.Text>

                <Title level={2} className="session-stats-card-value">
                  {stat.formatter === "currency" ? formatCurrency(stat.value) : stat.value}
                </Title>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<span className="session-table-title">Danh sách phiên sạc</span>}
        className="session-table-container"
        styles={{ body: { padding: "24px" } }}
      >
        <div
          className="session-margin-bottom-16"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center" }}>
            <Search
              placeholder="Tìm kiếm theo mã phiên sạc hoặc tên người dùng..."
              allowClear
              enterButton={
                <Button className="session-button-success-ghost">
                  <SearchOutlined />
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              className="session-search-input"
            />

            <Button
              onClick={() => {
                if (typeof fetchSessions === "function") {
                  fetchSessions();
                  message.success("Đang làm mới danh sách...");
                }
              }}
              size="large"
            >
              Làm mới
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredSessions}
          loading={loading}
          size="middle"
          className="session-table"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiên sạc`,
            pageSize: 10,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1300 }}
          bordered
          rowClassName={(record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")}
        />
      </Card>

      <Modal
        title="Yêu cầu thanh toán bằng tiền mặt"
        visible={showPaymentsModal}
        onCancel={() => setShowPaymentsModal(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <StaffPayments onClose={() => setShowPaymentsModal(false)} />
      </Modal>
    </div>
  );
};

export default SessionStaffPage;

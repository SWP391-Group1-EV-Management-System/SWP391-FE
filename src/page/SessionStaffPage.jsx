/**
 * SESSION STAFF PAGE
 *
 * Staff management interface for monitoring and controlling EV charging sessions.
 *
 * Features:
 * - View all charging sessions in real-time
 * - Filter sessions by status, user, date
 * - Control session operations (start, pause, complete, terminate)
 * - Session statistics and analytics
 * - Search and sort functionality
 *
 * @component
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Card,
  Statistic,
  Badge,
  Typography,
  Tooltip,
  Row,
  Col,
  Input,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import ReportModal from "../components/ReportModal";
import "../assets/styles/SessionStaff.css";
import "../assets/styles/utilities.css";

const { Title } = Typography;
const { Search } = Input;

// Constants cho tree-shaking tối ưu trong Vite
const SESSION_STATUS = {
  CHARGING: "charging",
  COMPLETED: "completed",
  INACTIVE: "inactive",
};

const STATUS_CONFIG = {
  [SESSION_STATUS.CHARGING]: { color: "processing", text: "Đang sạc" },
  [SESSION_STATUS.COMPLETED]: { color: "success", text: "Hoàn thành" },
  [SESSION_STATUS.INACTIVE]: { color: "default", text: "Không hoạt động" },
};

const SessionStaffPage = () => {
  const [chargingSessions, setChargingSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Memoized stats data với màu chính #43e97b
  const statsData = useMemo(
    () => [
      {
        title: "Tổng phiên sạc",
        value: 14,
        icon: <ThunderboltOutlined />,
        color: "#43e97b",
      },
      {
        title: "Đang sạc",
        value: 3,
        icon: <ClockCircleOutlined />,
        color: "#43e97b",
      },
      {
        title: "Hoàn thành",
        value: 11,
        icon: <CheckOutlined />,
        color: "#43e97b",
      },
      {
        title: "Tổng doanh thu",
        value: 1936350,
        formatter: "currency",
        icon: <DollarOutlined />,
        color: "#43e97b",
      },
    ],
    []
  );

  // Search handler
  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      if (!value) {
        setFilteredSessions(chargingSessions);
      } else {
        const filtered = chargingSessions.filter(
          (session) =>
            session.sessionId.toLowerCase().includes(value.toLowerCase()) ||
            session.userDriver.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSessions(filtered);
      }
    },
    [chargingSessions]
  );

  // Optimized action handler
  const handleAction = useCallback(
    (action, record) => {
      const actions = {
        start: () =>
          Modal.confirm({
            title: "Khởi động phiên sạc",
            content: `Bạn có chắc chắn muốn khởi động phiên sạc ${record.sessionId}?`,
            okText: "Khởi động",
            cancelText: "Hủy",
            onOk: () => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                message.success("Đã khởi động phiên sạc thành công!");
              }, 1000);
            },
          }),
        stop: () =>
          Modal.confirm({
            title: "Dừng phiên sạc",
            content: `Bạn có chắc chắn muốn dừng phiên sạc ${record.sessionId}?`,
            okText: "Dừng",
            cancelText: "Hủy",
            onOk: () => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                message.success("Đã dừng phiên sạc thành công!");
              }, 1000);
            },
          }),

        delete: () =>
          Modal.confirm({
            title: "Xóa phiên sạc",
            content: `Bạn có chắc chắn muốn xóa phiên sạc ${record.sessionId}? Hành động này không thể hoàn tác.`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
              const updatedSessions = chargingSessions.filter(
                (session) => session.key !== record.key
              );
              setChargingSessions(updatedSessions);
              setFilteredSessions(updatedSessions);
              message.success("Đã xóa phiên sạc thành công!");
            },
          }),
        confirmPayment: () =>
          Modal.confirm({
            title: "Xác nhận thanh toán",
            content: `Bạn có chắc chắn muốn xác nhận thanh toán cho phiên sạc ${record.sessionId}?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
              message.success("Đã xác nhận thanh toán thành công!");
            },
          }),
      };
      actions[action]?.();
    },
    [chargingSessions]
  );

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Đã làm mới dữ liệu!");
    }, 1500);
  }, []);

  // Report modal handlers
  const handleOpenReportModal = () => setIsReportModalOpen(true);
  const handleCloseReportModal = () => setIsReportModalOpen(false);
  const handleAddReport = (values) => {
    // You can handle report submission here
    // For now, just log
    console.log("Report added:", values);
  };

  // Memoized table columns với màu sắc mới
  const columns = useMemo(
    () => [
      {
        title: "Mã phiên",
        dataIndex: "sessionId",
        key: "sessionId",
        fixed: "left",
        width: 120,
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
            <Typography.Text className="session-text-dark">
              {text}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trụ",
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
        render: (text) => (
          <Typography.Text className="session-text-dark">
            {text}
          </Typography.Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        filters: [
          { text: "Đang sạc", value: SESSION_STATUS.CHARGING },
          { text: "Hoàn thành", value: SESSION_STATUS.COMPLETED },
          { text: "Không hoạt động", value: SESSION_STATUS.INACTIVE },
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
            <Typography.Text className="session-text-dark">
              {time}
            </Typography.Text>
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
          <Statistic
            value={amount}
            suffix="VND"
            valueStyle={{ fontSize: "14px" }}
            className="session-statistic-value-success"
            formatter={(value) => value.toLocaleString()}
          />
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 180,
        render: (_, record) => (
          <Space wrap>
            {record.status === SESSION_STATUS.CHARGING && (
              <Tooltip title="Dừng phiên sạc">
                <Button
                  size="small"
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleAction("stop", record)}
                />
              </Tooltip>
            )}

            {record.status === SESSION_STATUS.COMPLETED && (
              <Tooltip title="Xác nhận thanh toán">
                <Button
                  size="small"
                  className="session-action-button confirm-payment"
                  icon={<DollarOutlined />}
                  onClick={() => handleAction("confirmPayment", record)}
                />
              </Tooltip>
            )}

            <Tooltip title="Xóa phiên sạc">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleAction("delete", record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleAction]
  );

  /**
   * ===============================
   * DATA FETCHING EFFECT
   * ===============================
   */

  // Load charging sessions data from API on component mount
  useEffect(() => {
    const mockChargingSessions = [
      {
        id: "S001",
        user: { name: "Nguyen Van A" },
        chargingPost: { name: "Post 1", power: 50 },
        startTime: "2025-10-14T08:00:00Z",
        endTime: "2025-10-14T10:00:00Z",
        status: "completed",
        energyConsumed: 20.5,
        totalAmount: 410000,
      },
      {
        id: "S002",
        user: { name: "Tran Thi B" },
        chargingPost: { name: "Post 2", power: 30 },
        startTime: "2025-10-14T09:00:00Z",
        endTime: null,
        status: "charging",
        energyConsumed: 10.2,
        totalAmount: 204000,
      },
      {
        id: "S003",
        user: { name: "Le Van C" },
        chargingPost: { name: "Post 3", power: 20 },
        startTime: "2025-10-13T14:00:00Z",
        endTime: "2025-10-13T15:30:00Z",
        status: "completed",
        energyConsumed: 15.0,
        totalAmount: 300000,
      },
    ];

    const fetchChargingSessions = async () => {
      setLoading(true);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Transform mock data to UI table format
        const mappedData = mockChargingSessions.map((session, index) => ({
          key: index + 1,
          sessionId: session.id,
          userDriver: session.user?.name || "N/A",
          post: `${session.chargingPost?.name || "N/A"} (${
            session.chargingPost?.power || 0
          }kW)`,
          date: new Date(session.startTime).toLocaleDateString("vi-VN"),
          status: session.status,
          startTime: new Date(session.startTime).toLocaleTimeString("vi-VN"),
          endTime: session.endTime
            ? new Date(session.endTime).toLocaleTimeString("vi-VN")
            : null,
          kwh: session.energyConsumed || 0,
          totalAmount: session.totalAmount || 0,
        }));

        setChargingSessions(mappedData);
        setFilteredSessions(mappedData);
      } catch (error) {
        console.error("Error fetching charging sessions:", error);
        message.error("Không thể tải dữ liệu phiên sạc");
      } finally {
        setLoading(false);
      }
    };

    fetchChargingSessions();
  }, []);

  // Update filtered sessions when search changes
  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  return (
    <div className="session-staff-page">
      {/* Header Section */}
      <PageHeader
        title="Phiên sạc nhân viên"
        icon={<ThunderboltOutlined />}
        subtitle="Hệ thống quản lý trạm sạc xe điện thông minh, bền vững và thân thiện môi trường"
        actionButton={{
          icon: <ReloadOutlined />,
          text: "Hệ thống hoạt động tốt",
          onClick: handleRefresh,
        }}
      />

      {/* Statistics Cards với phong cách mới */}
      <Row gutter={[24, 24]} className="session-margin-bottom-32">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} lg={6} xl={6} key={index}>
            <Card
              hoverable
              className="session-stats-card"
              styles={{ body: { padding: "24px" } }}
            >
              <div className="session-text-center">
                {/* Icon */}
                <div className="session-margin-bottom-16">
                  <span className="session-text-large session-text-gray">
                    {stat.icon}
                  </span>
                </div>

                {/* Title */}
                <Typography.Text className="session-stats-card-title">
                  {stat.title}
                </Typography.Text>

                {/* Value */}
                <Title level={2} className="session-stats-card-value">
                  {stat.formatter === "currency"
                    ? `${stat.value?.toLocaleString()} VND`
                    : stat.value}
                </Title>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card
        title={<span className="session-table-title">Danh sách phiên sạc</span>}
        className="session-table-container"
        styles={{ body: { padding: "24px" } }}
        extra={
          <Space>
            <Badge count={3} color="orange" size="small">
              <Tag color="orange" className="session-status-tag charging">
                Đang sạc
              </Tag>
            </Badge>
            <Badge count={11} color="green" size="small">
              <Tag color="green" className="session-status-tag completed">
                Hoàn thành
              </Tag>
            </Badge>
          </Space>
        }
      >
        {/* Search Bar + Report Button */}
        <div className="session-margin-bottom-16" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, marginRight: 16 }}>
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
          </div>
          <Button
            type="primary"
            danger
            size="large"
            style={{ minWidth: 200 }}
            onClick={handleOpenReportModal}
          >
            Báo cáo sự cố trụ sạc
          </Button>
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phiên sạc`,
            pageSize: 10,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1300 }}
          bordered
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
        <ReportModal
          open={isReportModalOpen}
          onClose={handleCloseReportModal}
          reportData={null}
          isAdmin={false}
          onAddReport={handleAddReport}
          initialValues={{ title: "", description: "", type: "", isUrgent: false }}
          validationSchema={null}
        />
      </Card>
    </div>
  );
};

export default SessionStaffPage;

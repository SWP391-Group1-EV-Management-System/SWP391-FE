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
        payment: () =>
          Modal.confirm({
            title: "Xác nhận thanh toán",
            content: `Xác nhận thanh toán ${record.totalAmount.toLocaleString()} VND cho phiên sạc ${
              record.sessionId
            }?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                message.success("Đã xác nhận thanh toán thành công!");
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
            {record.status === SESSION_STATUS.CHARGING ? (
              <Tooltip title="Dừng phiên sạc">
                <Button
                  size="small"
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleAction("stop", record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Khởi động phiên sạc">
                <Button
                  size="small"
                  className="session-action-button start"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleAction("start", record)}
                />
              </Tooltip>
            )}

            <Tooltip title="Xác nhận thanh toán">
              <Button
                size="small"
                className="session-action-button payment"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction("payment", record)}
                disabled={record.status === SESSION_STATUS.CHARGING}
              />
            </Tooltip>

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
    /**
     * Fetch all charging sessions from the backend API
     * Transforms API data to table-compatible format
     */
    const fetchChargingSessions = async () => {
      setLoading(true);

      try {
        // TODO: Replace with actual API endpoint when backend is ready
        const response = await fetch("/api/charging-sessions");
        const data = await response.json();

        // Transform API data to UI table format
        const mappedData = data.map((session, index) => ({
          key: index + 1, // Unique row key for Ant Design Table
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

        // Update state with fetched data
        setChargingSessions(mappedData);
        setFilteredSessions(mappedData);
      } catch (error) {
        console.error("Error fetching charging sessions:", error);
        message.error("Không thể tải dữ liệu phiên sạc");

        // Fallback to empty state on error
        setChargingSessions([]);
        setFilteredSessions([]);
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
        {/* Search Bar */}
        <div className="session-margin-bottom-16">
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
      </Card>
    </div>
  );
};

export default SessionStaffPage;

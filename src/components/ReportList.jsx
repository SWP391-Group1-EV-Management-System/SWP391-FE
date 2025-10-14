import React, { useState } from "react";
import { Table, Button } from "antd";
import ReportModal from "./ReportModal";

const errorTypes = {
  connection: "Kết nối lỏng, chập điện",
  component: "Hư hỏng linh kiện (quá nhiệt, hỏng bộ sạc)",
  communication: "Lỗi giao tiếp giữa sạc và xe",
  voltage: "Lỗi điện áp (quá cao, quá thấp)",
  battery: "Hỏng pin/bình ắc quy",
  other: "Khác"
};

const mockReports = [
  {
    id: 1,
    title: "Lỗi kết nối",
    description: "Cáp sạc bị lỏng, không nhận kết nối với xe.",
    type: "connection",
    isUrgent: true,
  },
  {
    id: 2,
    title: "Quá nhiệt bộ sạc",
    description: "Bộ sạc quá nóng khi sử dụng liên tục.",
    type: "component",
    isUrgent: true,
  },
  {
    id: 3,
    title: "Lỗi giao tiếp",
    description: "Xe không nhận tín hiệu từ trạm sạc.",
    type: "communication",
    isUrgent: false,
  },
  {
    id: 4,
    title: "Điện áp thấp",
    description: "Điện áp đầu ra thấp hơn mức yêu cầu.",
    type: "voltage",
    isUrgent: false,
  },
  {
    id: 5,
    title: "Hỏng pin",
    description: "Pin xe không thể sạc hoặc xả điện.",
    type: "battery",
    isUrgent: true,
  },
  {
    id: 6,
    title: "Khác",
    description: "Lỗi không xác định, cần kiểm tra thêm.",
    type: "other",
    isUrgent: false,
  },
];

const ReportList = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewReport = (record) => {
    setSelectedReport(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Loại lỗi", dataIndex: "type", key: "type", render: (val) => errorTypes[val] },
    { title: "Khẩn cấp", dataIndex: "isUrgent", key: "isUrgent", render: (val) => (val ? "Có" : "Không") },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewReport(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Table dataSource={mockReports} columns={columns} rowKey="id" />
      {selectedReport && (
        <ReportModal
          open={isModalOpen}
          onClose={handleCloseModal}
          reportData={selectedReport}
          isAdmin={true}
          onAddReport={null}
          initialValues={selectedReport}
          validationSchema={null}
        />
      )}
    </div>
  );
};

export default ReportList;
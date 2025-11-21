import React from "react";
import PageHeader from "../components/PageHeader";
import StaffPayments from "../components/staff/StaffPayments";
import { DollarOutlined } from "@ant-design/icons";

const StaffPaymentsPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <PageHeader
        title="Thanh toán (Nhân viên)"
        icon={<DollarOutlined />}
        subtitle="Quản lý yêu cầu thanh toán bằng tiền mặt"
      />
      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <StaffPayments />
      </div>
    </div>
  );
};

export default StaffPaymentsPage;

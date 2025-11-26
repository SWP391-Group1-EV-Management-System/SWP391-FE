// Trang thanh toán nhân viên - quản lý yêu cầu thanh toán bằng tiền mặt
import React from "react";
import PageHeader from "../components/PageHeader";
import StaffPayments from "../components/staff/StaffPayments";
import { DollarOutlined } from "@ant-design/icons";

const StaffPaymentsPage = () => {
  return (
    <div style={{ padding: 20 }}>
      {/* Header trang */}
      <PageHeader
        title="Thanh toán (Nhân viên)"
        icon={<DollarOutlined />}
        subtitle="Quản lý yêu cầu thanh toán bằng tiền mặt"
      />
      
      {/* Component quản lý thanh toán */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <StaffPayments />
      </div>
    </div>
  );
};

export default StaffPaymentsPage;

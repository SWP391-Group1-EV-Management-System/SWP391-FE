import { MdFlashOn, MdPauseCircleFilled, MdCheckCircle, MdError, MdPower } from "react-icons/md";

export const getStatusConfig = (status) => {
  switch (status) {
    case "charging":
      return { bg: "success", icon: MdFlashOn, text: "Đang sạc", color: "#10b981" };
    case "stopping":
      return { bg: "warning", icon: MdPauseCircleFilled, text: "Dừng sạc", color: "#f59e0b" };
    case "completed":
      return { bg: "success", icon: MdCheckCircle, text: "Hoàn tất", color: "#10b981" };
    case "error":
      return { bg: "danger", icon: MdError, text: "Lỗi", color: "#ef4444" };
    default:
      return { bg: "secondary", icon: MdPower, text: "Kết nối", color: "#6b7280" };
  }
};

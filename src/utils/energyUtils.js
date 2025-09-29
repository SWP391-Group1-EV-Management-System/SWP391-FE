export const getStatusConfig = (status) => {
  switch (status) {
    case "charging":
      return { bg: "success", icon: "⚡", text: "Đang sạc", color: "#10b981" };
    case "stopping":
      return { bg: "warning", icon: "⏸️", text: "Dừng sạc", color: "#f59e0b" };
    case "completed":
      return { bg: "success", icon: "✅", text: "Hoàn tất", color: "#10b981" };
    case "error":
      return { bg: "danger", icon: "⚠️", text: "Lỗi", color: "#ef4444" };
    default:
      return { bg: "secondary", icon: "🔌", text: "Kết nối", color: "#6b7280" };
  }
};

export const calculateProgress = (batteryLevel) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  return circumference - (batteryLevel / 100) * circumference;
};

export const formatTime = (timeString) => {
  // Add time formatting utilities here
  return timeString;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
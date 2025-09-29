export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const getStatusBadge = (status) => {
  const badges = {
    'Hoàn tất': 'success',
    'Đang sạc': 'primary',
    'Thất bại': 'danger',
    'Hủy': 'warning'
  };
  return badges[status] || 'secondary';
};
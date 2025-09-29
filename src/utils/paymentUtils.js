export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const savedCards = [
  { id: 1, number: '**** **** **** 1234', type: 'Vietcombank', expiry: '12/25' },
  { id: 2, number: '**** **** **** 5678', type: 'Techcombank', expiry: '03/26' },
];

// Tính toán tổng tiền từ session data thực
export const calculateSessionTotal = (sessionData) => {
  if (!sessionData) return 0;
  
  const chargingCost = sessionData.chargingCost || 0;
  const serviceFee = sessionData.serviceFee || 0;
  const tax = sessionData.tax || 0;
  
  return chargingCost + serviceFee + tax;
};

// Tính phí cao điểm (nếu có)
export const calculatePeakHourSurcharge = (sessionData) => {
  if (!sessionData?.startTime) return 0;
  
  const startHour = new Date(sessionData.startTime).getHours();
  
  // Giờ cao điểm: 7-9h sáng và 17-19h chiều
  const isPeakHour = (startHour >= 7 && startHour <= 9) || (startHour >= 17 && startHour <= 19);
  
  if (isPeakHour) {
    return Math.round(sessionData.chargingCost * 0.15); // 15% phụ phí cao điểm
  }
  
  return 0;
};

// Validate session data trước khi thanh toán
export const validateSessionForPayment = (sessionData) => {
  if (!sessionData) {
    return { isValid: false, error: 'Không có thông tin phiên sạc' };
  }
  
  if (!sessionData.isDone) {
    return { isValid: false, error: 'Phiên sạc chưa hoàn thành' };
  }
  
  if (!sessionData.kwh || sessionData.kwh <= 0) {
    return { isValid: false, error: 'Phiên sạc không có năng lượng tiêu thụ' };
  }
  
  if (!sessionData.totalAmount || sessionData.totalAmount <= 0) {
    return { isValid: false, error: 'Số tiền thanh toán không hợp lệ' };
  }
  
  return { isValid: true };
};

// Format thông tin phiên sạc để hiển thị
export const formatSessionInfo = (sessionData) => {
  if (!sessionData) return null;
  
  return {
    sessionId: sessionData.session_id,
    station: sessionData.station,
    address: sessionData.address,
    chargingType: sessionData.chargingType,
    energyConsumed: `${sessionData.kwh} kWh`,
    duration: sessionData.time,
    chargingDate: sessionData.date,
    vehicle: sessionData.vehicle
  };
};

// Export reservationData mặc định cho backward compatibility
export const reservationData = {
  station: 'EcoCharge Station #42',
  district: 'District 1', 
  address: '123 Green Street, Ho Chi Minh City',
  chargingType: 'Fast Charging (50kW DC)',
  date: 'May 15, 2023',
  time: '10:00 AM - 11:30 AM (1.5 hours)',
  vehicle: 'Tesla Model 3 (ABC-1234)',
  chargingCost: 180000,
  serviceFee: 25000,
  tax: 20500
};
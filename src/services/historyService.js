import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Đổi thành domain BE đúng

// Lấy tất cả lịch sử phiên sạc của user
export const fetchChargingHistory = async (userId) => {
  try {
    // Gọi API lấy tất cả phiên sạc của user
    const response = await axios.get(`${API_BASE_URL}/api/payment/paymentByUser/${userId}`);
    if (!response.data) throw new Error('Không có dữ liệu lịch sử sạc');
    // Dữ liệu trả về là danh sách payment, mỗi payment có chargingSessionId
    // Gọi tiếp API lấy chi tiết từng phiên sạc
    const sessions = await Promise.all(
      response.data.map(async (payment) => {
        const sessionRes = await axios.get(`${API_BASE_URL}/api/charging/session/show/${payment.chargingSessionId}`);
        return {
          ...sessionRes.data,
          payment: payment
        };
      })
    );
    return sessions;
  } catch (error) {
    console.error('Error fetching charging history:', error);
    throw new Error('Không thể tải dữ liệu lịch sử sạc từ server');
  }
};
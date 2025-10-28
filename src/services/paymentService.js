import api from '../utils/axios';

export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/payment/paymentMethod', paymentData);
    if (response.status === 200) {
      // Nếu backend trả về message, không phụ thuộc vào chuỗi — status 200 coi là thành công
      return true;
    }
    return false;
  } catch (error) {
    // Nếu backend explicit trả lỗi quota / choose payment method => trả về false để frontend xử lý
    if (error.response?.status === 500) {
      const errorMessage = error.response?.data || '';
      if (
        errorMessage.includes('Failed to choose') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('không đủ')
      ) {
        return false;
      }
    }
    throw error;
  }
};

// Create MoMo payment
export const createMomoPayment = async (momoRequestData) => {
  try {
    const response = await api.post('/api/payment/createPayment', momoRequestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Handle IPN callback from MoMo
export const handleIPN = async (ipnData) => {
  try {
    const response = await api.post('/api/payment/ipn-handler', ipnData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Complete payment callback
export const completePayment = async (requestData) => {
  try {
    const response = await api.post('/api/payment/completedPayment', requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get payment by payment ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`/api/payment/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all payments by user ID
export const getPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get unpaid payments by user ID
export const getUnpaidPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/UnPaid/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get paid payments by user ID
export const getPaidPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/Paid/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all payments (admin)
export const getAllPayments = async () => {
  try {
    const response = await api.get('/api/payment/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};
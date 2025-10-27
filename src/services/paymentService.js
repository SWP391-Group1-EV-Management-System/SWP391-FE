import api from '../utils/axios';

export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/payment/paymentMethod', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Create MoMo payment
export const createMomoPayment = async (momoRequestData) => {
  try {
    const response = await api.post('/api/payment/createPayment', momoRequestData);
    return response.data;
  } catch (error) {
    console.error('Error creating MoMo payment:', error);
    throw error;
  }
};

// Handle IPN callback from MoMo
export const handleIPN = async (ipnData) => {
  try {
    const response = await api.post('/api/payment/ipn-handler', ipnData);
    return response.data;
  } catch (error) {
    console.error('Error handling IPN:', error);
    throw error;
  }
};

// Complete payment callback
export const completePayment = async (requestData) => {
  try {
    const response = await api.post('/api/payment/completedPayment', requestData);
    return response.data;
  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
};

// Get payment by payment ID
export const getPaymentById = async (paymentId) => {
//   try {
//     const response = await api.get(`/api/payment/${paymentId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error getting payment:', error);
//     throw error;
//   }
// };
try {
  // Dùng paymentId hard-code để test
  const testPaymentId = 'YMTL8982';
  const response = await api.get(`/api/payment/${testPaymentId}`);
  console.log('📦 API Response:', response.data); // Log để xem data trả về
  return response.data;
} catch (error) {
  console.error('❌ Error getting payment:', error);
  console.error('❌ Error details:', error.response?.data); // Log chi tiết lỗi
  throw error;
}
};


// Get all payments by user ID
export const getPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw error;
  }
};


// Get unpaid payments by user ID
export const getUnpaidPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/UnPaid/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting unpaid payments:', error);
    throw error;
  }
};

// Get paid payments by user ID
export const getPaidPaymentsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/payment/paymentByUser/Paid/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting paid payments:', error);
    throw error;
  }
};

// Get all payments (admin)
export const getAllPayments = async () => {
  try {
    const response = await api.get('/api/payment/all');
    return response.data;
  } catch (error) {
    console.error('Error getting all payments:', error);
    throw error;
  }
};
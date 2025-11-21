import api from "../utils/axios";

export const getCashPaymentRequests = async (staffId) => {
  try {
    const response = await api.get(`/api/staff/paymentRequestCash/${staffId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cash payment requests:", error);
    throw error;
  }
};

export const confirmCashPayment = async (paymentId) => {
  try {
    const response = await api.post(`/api/staff/staffConfirmPayment/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error confirming cash payment:", error);
    throw error;
  }
};

export default { getCashPaymentRequests, confirmCashPayment };

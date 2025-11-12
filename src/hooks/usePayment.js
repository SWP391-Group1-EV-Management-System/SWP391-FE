import { useState, useCallback } from 'react';
import { 
  createMomoPayment as createMomoPaymentService,
  processPayment as processPaymentService,
  completePayment as completePaymentService,
  getPaymentById,
  getPaymentsByUserId,
  getUnpaidPaymentsByUserId,
  getPaidPaymentsByUserId,
  getAllPayments as getAllPaymentsService
} from '../services/paymentService';

// Hook xử lý các thao tác payment
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý thanh toán
  const processPayment = useCallback(async (paymentId, paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      const paymentData = {
        paymentId: paymentId,
        paymentMethodId: paymentMethodId
      };
      const res = await processPaymentService(paymentData);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo thanh toán Momo
  const createMomoPayment = useCallback(async (orderId, amount, orderInfo) => {
    setLoading(true);
    setError(null);
    try {
      const momoRequestData = { orderId, amount, orderInfo, extraData: "" };
      const res = await createMomoPaymentService(momoRequestData);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hoàn thành thanh toán
  const completePayment = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await completePaymentService({ orderId });
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    processPayment,
    createMomoPayment,
    completePayment,
  };
};

// Hook lấy dữ liệu payment
export const usePaymentData = () => {
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy payment theo ID
  const fetchPaymentById = useCallback(async (paymentId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentById(paymentId);
      setPayment(res);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy tất cả payment của user
  const fetchPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy payment chưa thanh toán
  const fetchUnpaidPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUnpaidPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy payment đã thanh toán
  const fetchPaidPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaidPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy tất cả payment
  const fetchAllPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPaymentsService();
      setPayments(res);
      return res;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    payment,
    loading,
    error,
    fetchPaymentById,
    fetchPaymentsByUserId,
    fetchUnpaidPaymentsByUserId,
    fetchPaidPaymentsByUserId,
    fetchAllPayments,
  };
};

// Hook kết hợp tất cả payment operations
export const usePaymentManager = () => {
  const paymentOperations = usePayment();
  const paymentData = usePaymentData();

  return {
    ...paymentOperations,
    ...paymentData,
  };
};
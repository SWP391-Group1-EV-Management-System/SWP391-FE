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

// Hook for payment operations
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const completePayment = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [usePayment] Completing payment for order:', orderId);
      const res = await completePaymentService({ orderId });
      console.log('✅ [usePayment] Complete payment response:', res);
      return res;
    } catch (err) {
      console.error('❌ [usePayment] Complete payment error:', err);
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

// Hook for fetching payment data
export const usePaymentData = () => {
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentById = useCallback(async (paymentId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [usePaymentData] Fetching payment by ID:', paymentId);
      const res = await getPaymentById(paymentId);
      console.log('✅ [usePaymentData] Payment fetched:', res);
      setPayment(res);
      return res;
    } catch (err) {
      console.error('❌ [usePaymentData] Fetch payment error:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [usePaymentData] Fetching payments for user:', userId);
      const res = await getPaymentsByUserId(userId);
      console.log('✅ [usePaymentData] Payments fetched:', res?.length, 'items');
      setPayments(res);
      return res;
    } catch (err) {
      console.error('❌ [usePaymentData] Fetch payments error:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnpaidPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [usePaymentData] Fetching unpaid payments for user:', userId);
      const res = await getUnpaidPaymentsByUserId(userId);
      console.log('✅ [usePaymentData] Unpaid payments fetched:', res?.length, 'items');
      setPayments(res);
      return res;
    } catch (err) {
      console.error('❌ [usePaymentData] Fetch unpaid payments error:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaidPaymentsByUserId = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [usePaymentData] Fetching paid payments for user:', userId);
      const res = await getPaidPaymentsByUserId(userId);
      console.log('✅ [usePaymentData] Paid payments fetched:', res?.length, 'items');
      setPayments(res);
      return res;
    } catch (err) {
      console.error('❌ [usePaymentData] Fetch paid payments error:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [usePaymentData] Fetching all payments');
      const res = await getAllPaymentsService();
      console.log('✅ [usePaymentData] All payments fetched:', res?.length, 'items');
      setPayments(res);
      return res;
    } catch (err) {
      console.error('❌ [usePaymentData] Fetch all payments error:', err);
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

// Combined hook for all payment operations
export const usePaymentManager = () => {
  const paymentOperations = usePayment();
  const paymentData = usePaymentData();

  return {
    ...paymentOperations,
    ...paymentData,
  };
};
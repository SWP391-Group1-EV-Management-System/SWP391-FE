import { useState, useCallback } from 'react';
import paymentService from '../services/paymentService';

// Hook for payment operations
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = useCallback(async (paymentId, paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      const paymentData = {
        paymentId,
        paymentMethod: { idPaymentMethod: paymentMethodId }
      };
      const res = await paymentService.processPayment(paymentData);
      return res;
    } catch (err) {
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
      const momoRequestData = { orderId, amount, orderInfo };
      const res = await paymentService.createMomoPayment(momoRequestData);
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
      const res = await paymentService.completePayment({ orderId });
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
      const res = await paymentService.getPaymentById(paymentId);
      setPayment(res);
      return res;
    } catch (err) {
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
      const res = await paymentService.getPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
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
      const res = await paymentService.getUnpaidPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
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
      const res = await paymentService.getPaidPaymentsByUserId(userId);
      setPayments(res);
      return res;
    } catch (err) {
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
      const res = await paymentService.getAllPayments();
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

// Combined hook for all payment operations
export const usePaymentManager = () => {
  const paymentOperations = usePayment();
  const paymentData = usePaymentData();

  return {
    ...paymentOperations,
    ...paymentData,
  };
};
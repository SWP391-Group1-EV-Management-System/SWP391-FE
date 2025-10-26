import { useState, useCallback } from 'react';
import { createPaymentPacket as createPaymentPacketService } from '../services/paymentPackageService';

export const usePaymentPackage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentPacket = useCallback(async (userId, packageId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createPaymentPacketService(userId, packageId);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message || err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPaymentPacket,
  };
};

export default usePaymentPackage;
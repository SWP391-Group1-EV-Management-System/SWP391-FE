import api from '../utils/axios';

export const createPaymentPacket = async (userId, packageId) => {
  const res = await api.post('/api/payment-service-packages/CreatePaymentPacket', {
    userId,
    packageId,
  });
  return res.data;
};

export default createPaymentPacket;
import { useState } from 'react';
import {
  createBooking as apiCreateBooking,
  completeBooking as apiCompleteBooking,
  cancelBooking as apiCancelBooking,
  getBookingsByPost as apiGetBookingsByPost,
  getBookingsByStation as apiGetBookingsByStation,
  getBookingsByUser as apiGetBookingsByUser,
  getBookingsByDate as apiGetBookingsByDate,
  getBookingByWaitingListId as apiGetBookingByWaitingListId,
  getBookingById as apiGetBookingById,
  getBookingsByStatus as apiGetBookingsByStatus,
} from '../hooks/useBooking';

const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    createBooking: (bookingData) => handleApiCall(apiCreateBooking, bookingData),
    completeBooking: (bookingId) => handleApiCall(apiCompleteBooking, bookingId),
    cancelBooking: (bookingId) => handleApiCall(apiCancelBooking, bookingId),
    getBookingsByPost: (postId) => handleApiCall(apiGetBookingsByPost, postId),
    getBookingsByStation: (stationId) => handleApiCall(apiGetBookingsByStation, stationId),
    getBookingsByUser: (userId) => handleApiCall(apiGetBookingsByUser, userId),
    getBookingsByDate: (date) => handleApiCall(apiGetBookingsByDate, date),
    getBookingByWaitingListId: (waitingListId) => handleApiCall(apiGetBookingByWaitingListId, waitingListId),
    getBookingById: (bookingId) => handleApiCall(apiGetBookingById, bookingId),
    getBookingsByStatus: (statusList) => handleApiCall(apiGetBookingsByStatus, statusList),
  };
};

export default useBooking;
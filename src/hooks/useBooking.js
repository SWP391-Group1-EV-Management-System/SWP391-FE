import { useState, useCallback } from 'react';
import * as bookingService from '../services/bookingService';

// Hook to manage booking-related operations and local state
export default function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [booking, setBooking] = useState(null);

  const wrap = useCallback(async (fn, setResult) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (typeof setResult === 'function') setResult(res);
      setLoading(false);
      return res;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const createBooking = useCallback(async (bookingData) => {
    return wrap(() => bookingService.createBooking(bookingData));
  }, [wrap]);

  const completeBooking = useCallback(async (bookingId) => {
    return wrap(() => bookingService.completeBooking(bookingId));
  }, [wrap]);

  const cancelBooking = useCallback(async (bookingId) => {
    return wrap(() => bookingService.cancelBooking(bookingId));
  }, [wrap]);

  const fetchBookingsByPost = useCallback(async (postId) => {
    return wrap(() => bookingService.getBookingsByPost(postId), setBookings);
  }, [wrap]);

  const fetchBookingsByStation = useCallback(async (stationId) => {
    return wrap(() => bookingService.getBookingsByStation(stationId), setBookings);
  }, [wrap]);

  const fetchBookingsByUser = useCallback(async (userId) => {
    return wrap(() => bookingService.getBookingsByUser(userId), setBookings);
  }, [wrap]);

  const fetchBookingsByDate = useCallback(async (date) => {
    return wrap(() => bookingService.getBookingsByDate(date), setBookings);
  }, [wrap]);

  const fetchBookingByWaitingListId = useCallback(async (waitingListId) => {
    return wrap(() => bookingService.getBookingByWaitingListId(waitingListId), setBooking);
  }, [wrap]);

  const fetchBookingById = useCallback(async (bookingId) => {
    return wrap(() => bookingService.getBookingById(bookingId), setBooking);
  }, [wrap]);

  const fetchBookingsByStatus = useCallback(async (statusList) => {
    return wrap(() => bookingService.getBookingsByStatus(statusList), setBookings);
  }, [wrap]);

  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setBookings(null);
    setBooking(null);
  }, []);

  return {
    loading,
    error,
    bookings,
    booking,
    createBooking,
    completeBooking,
    cancelBooking,
    fetchBookingsByPost,
    fetchBookingsByStation,
    fetchBookingsByUser,
    fetchBookingsByDate,
    fetchBookingByWaitingListId,
    fetchBookingById,
    fetchBookingsByStatus,
    clear,
  };
}

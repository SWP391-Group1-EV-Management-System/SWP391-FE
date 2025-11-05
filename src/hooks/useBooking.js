import { useState, useCallback } from "react";
import * as bookingService from "../services/bookingService";

/**
 * Hook quản lý booking
 *
 * ✅ Redis-based status:
 * - Backend tự động lưu status vào Redis khi tạo/hoàn thành/hủy booking
 * - Frontend dispatch event "driverStatusChanged" để trigger refetch
 */
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
      if (typeof setResult === "function") setResult(res);
      setLoading(false);
      return res;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Tạo booking mới
   * BE response: { status: "booking" } hoặc { status: "waiting" }
   */
  const createBooking = useCallback(
    async (bookingData) => {
      const result = await wrap(() =>
        bookingService.createBooking(bookingData)
      );

      // ✅ Backend tự động set Redis, frontend chỉ dispatch event để refetch
      if (result?.status) {
        try {
          console.log("✅ Booking created with status:", result.status);

          // ✅ Dispatch custom event để useDriverStatus hook refetch từ Redis
          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: result.status },
            })
          );
        } catch (error) {
          console.error("Error dispatching status event:", error);
        }
      }

      return result;
    },
    [wrap]
  );

  const completeBooking = useCallback(
    async (bookingId) => {
      const result = await wrap(() =>
        bookingService.completeBooking(bookingId)
      );

      // ✅ Backend tự động xóa Redis, frontend chỉ dispatch event
      if (result?.success) {
        try {
          console.log("✅ Booking completed, status cleared");

          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: null },
            })
          );
        } catch (error) {
          console.error("Error dispatching status event:", error);
        }
      }

      return result;
    },
    [wrap]
  );

  const cancelBooking = useCallback(
    async (bookingId) => {
      const result = await wrap(() => bookingService.cancelBooking(bookingId));

      // ✅ Backend tự động xóa Redis, frontend chỉ dispatch event
      if (result?.success) {
        try {
          console.log("✅ Booking cancelled, status cleared");

          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: null },
            })
          );
        } catch (error) {
          console.error("Error dispatching status event:", error);
        }
      }

      return result;
    },
    [wrap]
  );

  const fetchBookingsByPost = useCallback(
    async (postId) => {
      return wrap(() => bookingService.getBookingsByPost(postId), setBookings);
    },
    [wrap]
  );

  const fetchBookingsByStation = useCallback(
    async (stationId) => {
      return wrap(
        () => bookingService.getBookingsByStation(stationId),
        setBookings
      );
    },
    [wrap]
  );

  const fetchBookingsByUser = useCallback(
    async (userId) => {
      console.log("🔍 [useBooking] Fetching bookings for userId:", userId);
      const result = await wrap(
        () => bookingService.getBookingsByUser(userId),
        setBookings
      );
      console.log("✅ [useBooking] Bookings fetched:", result);
      return result;
    },
    [wrap]
  );

  const fetchBookingsByDate = useCallback(
    async (date) => {
      return wrap(() => bookingService.getBookingsByDate(date), setBookings);
    },
    [wrap]
  );

  const fetchBookingByWaitingListId = useCallback(
    async (waitingListId) => {
      return wrap(
        () => bookingService.getBookingByWaitingListId(waitingListId),
        setBooking
      );
    },
    [wrap]
  );

  const fetchBookingById = useCallback(
    async (bookingId) => {
      return wrap(() => bookingService.getBookingById(bookingId), setBooking);
    },
    [wrap]
  );

  const fetchBookingsByStatus = useCallback(
    async (statusList) => {
      return wrap(
        () => bookingService.getBookingsByStatus(statusList),
        setBookings
      );
    },
    [wrap]
  );

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

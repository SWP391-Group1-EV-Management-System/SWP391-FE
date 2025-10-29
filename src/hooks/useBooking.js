import { useState, useCallback } from "react";
import * as bookingService from "../services/bookingService";

/**
 * Hook quản lý booking với localStorage status
 *
 * THAY ĐỔI:
 * - Sau khi createBooking thành công, lưu status vào localStorage
 * - Menu sẽ tự động cập nhật khi localStorage thay đổi
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

      // ✅ Lưu status vào localStorage nếu có trong response
      if (result?.status) {
        try {
          localStorage.setItem("driverStatus", result.status);
          console.log("✅ Saved status to localStorage:", result.status);

          // ✅ Dispatch custom event để Menu update ngay (cùng tab)
          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: result.status },
            })
          );
        } catch (error) {
          console.error("Error saving status to localStorage:", error);
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

      // ✅ Xóa status khi complete booking
      if (result?.success) {
        try {
          localStorage.removeItem("driverStatus");
          console.log("✅ Removed status from localStorage");

          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: null },
            })
          );
        } catch (error) {
          console.error("Error removing status from localStorage:", error);
        }
      }

      return result;
    },
    [wrap]
  );

  const cancelBooking = useCallback(
    async (bookingId) => {
      const result = await wrap(() => bookingService.cancelBooking(bookingId));

      // ✅ Xóa status khi cancel booking
      if (result?.success) {
        try {
          localStorage.removeItem("driverStatus");
          console.log("✅ Removed status from localStorage");

          window.dispatchEvent(
            new CustomEvent("driverStatusChanged", {
              detail: { status: null },
            })
          );
        } catch (error) {
          console.error("Error removing status from localStorage:", error);
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
      return wrap(() => bookingService.getBookingsByUser(userId), setBookings);
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

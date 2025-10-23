import api from '../utils/axios';

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/booking/create', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const completeBooking = async (bookingId) => {
  try {
    const response = await api.post(`/api/booking/complete/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.post(`/api/booking/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

export const getBookingsByPost = async (postId) => {
  try {
    const response = await api.get(`/api/booking/getByPost/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by post:', error);
    throw error;
  }
};

export const getBookingsByStation = async (stationId) => {
  try {
    const response = await api.get(`/api/booking/getByStation/${stationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by station:', error);
    throw error;
  }
};

export const getBookingsByUser = async (userId) => {
  try {
    const response = await api.get(`/api/booking/getByUser/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by user:', error);
    throw error;
  }
};

export const getBookingsByDate = async (date) => {
  try {
    const response = await api.get(`/api/booking/getByCreatedDate?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by date:', error);
    throw error;
  }
};

export const getBookingByWaitingListId = async (waitingListId) => {
  try {
    const response = await api.get(`/api/booking/getByWaitingListId/${waitingListId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by waiting list ID:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/api/booking/getByBookingId/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    throw error;
  }
};

export const getBookingsByStatus = async (statusList) => {
  try {
    const response = await api.get(`/api/booking/getByStatus/${statusList}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    throw error;
  }
};
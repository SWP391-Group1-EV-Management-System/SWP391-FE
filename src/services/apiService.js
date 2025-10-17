//import { api } from "./api";

// src/apiService.js
// Centralized API service for all controllers/entities

// ===================== ENTITY LIST =====================
// BookingEntity {
//   bookingId, waitingList, user, chargingStation, chargingPost, car, createdAt, maxWaitingTime, status, arrivalTime, chargingSession
// }
// ChargingPostEntity {
//   idChargingPost, maxPower, chargingFeePerKWh, chargingStation, chargingSessions, chargingType, waitingList, bookings, active
// }
// CarEntity {
//   carID, licensePlate, user, typeCar, chassisNumber, chargingType, waitingList, bookingList
// }
// ChargingTypeEntity {
//   idChargingType, nameChargingType, description, chargingTypeStationEntityList
// }
// ChargingSessionEntity {
//   chargingSessionId, expectedEndTime, booking, chargingPost, station, user, userManage, startTime, endTime, totalAmount, payment, done, kwh
// }
// ChargingStationEntity {
//   idChargingStation, nameChargingStation, address, establishedTime, numberOfPosts, chargingPosts, chargingSession, waitingList, bookings, active, userManager
// }
// PaymentEntity {
//   paymentId, user, chargingSessionId, createdAt, paidAt, paymentMethod, price, session, paid
// }
// PaymentMethodEntity {
//   idPaymentMethod, namePaymentMethod, paymentEntities
// }
// ReputationLevelEntity {
//   levelID, levelName, minScore, maxScore, maxWaitMinutes, description
// }
// UserEntity {
//   userID, firstName, lastName, birthDate, gender, role, email, password, phoneNumber, createdAt, status, cars, userReputations, chargingStation, payments, waitingLists, bookings, userSession, userManagerSession
// }
// UserReputationEntity {
//   userReputationID, user, reputationLevel, currentScore, notes, createdAt
// }
// WaitingListEntity {
//   waitingListId, expectedWaitingTime, user, chargingStation, chargingPost, car, outedAt, createdAt, status, booking
// }
// ===================== END ENTITY LIST =====================

// Charging Session APIs
export const chargingSessionAPI = {
  finish: (sessionId, data) => api.post(`/api/charging/session/finish/${sessionId}`, data),
  create: (data) => api.post('/api/charging/session/create', data),
  show: (sessionId) => api.get(`/api/charging/session/show/${sessionId}`),
};

// Charging Post APIs
export const chargingPostAPI = {
  update: (postId, data) => api.post(`/api/charging/post/update/${postId}`, data),
  create: (data) => api.post('/api/charging/post/create', data),
  getById: (postId) => api.get(`/api/charging/post/${postId}`),
  getAll: () => api.get('/api/charging/post/all'),
};

// Payment APIs
export const paymentAPI = {
  addPaymentMethod: (data) => api.post('/api/payment/paymentMethod', data),
  getInvoice: (paymentId) => api.post(`/api/payment/invoice/${paymentId}`),
  getById: (paymentId) => api.get(`/api/payment/${paymentId}`),
  getByUser: (userId) => api.get(`/api/payment/paymentByUser/${userId}`),
  getAll: () => api.get('/api/payment/all'),
};

// Charging Type APIs
export const chargingTypeAPI = {
  create: (data) => api.post('/api/charging/type/create', data),
  getById: (typeId) => api.get(`/api/charging/type/${typeId}`),
  delete: (typeId) => api.delete(`/api/charging/type/${typeId}`),
  getAll: () => api.get('/api/charging/type/all'),
};

// Waiting List APIs
export const waitingListAPI = {
  create: (data) => api.post('/api/waiting-list/create', data),
  getById: (id) => api.get(`/api/waiting-list/${id}`),
  getAll: () => api.get('/api/waiting-list/all'),
  delete: (id) => api.delete(`/api/waiting-list/${id}`),
};

// User Reputation APIs
export const userReputationAPI = {
  getByUser: (userId) => api.get(`/api/user-reputation/${userId}`),
  update: (userId, data) => api.put(`/api/user-reputation/${userId}`, data),
};

// Car APIs
export const carAPI = {
  create: (data) => api.post('/api/car/create', data),
  getById: (carId) => api.get(`/api/car/${carId}`),
  getAll: () => api.get('/api/car/all'),
  update: (carId, data) => api.put(`/api/car/${carId}`, data),
  delete: (carId) => api.delete(`/api/car/${carId}`),
};

// Register & Login APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/users/login', data), // Sửa endpoint đăng nhập cho đúng với BE
  refreshToken: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
};

// Reputation Level APIs
export const reputationLevelAPI = {
  getAll: () => api.get('/api/reputation-level/all'),
  getById: (id) => api.get(`/api/reputation-level/${id}`),
};

// Charging Station APIs
export const chargingStationAPI = {
  create: (data) => api.post('/api/charging/station/create', data),
  getById: (stationId) => api.get(`/api/charging/station/${stationId}`),
  getAll: () => api.get('/api/charging/station/all'),
  update: (stationId, data) => api.put(`/api/charging/station/${stationId}`, data),
  delete: (stationId) => api.delete(`/api/charging/station/${stationId}`),
};

// Payment Method APIs
export const paymentMethodAPI = {
  create: (data) => api.post('/api/payment-method/create', data),
  getById: (id) => api.get(`/api/payment-method/${id}`),
  getAll: () => api.get('/api/payment-method/all'),
  update: (id, data) => api.put(`/api/payment-method/${id}`, data),
  delete: (id) => api.delete(`/api/payment-method/${id}`),
};

// User APIs
export const userAPI = {
  create: (data) => api.post('/api/user/create', data),
  getById: (userId) => api.get(`/api/user/${userId}`),
  getAll: () => api.get('/api/user/all'),
  update: (userId, data) => api.put(`/api/user/${userId}`, data),
  delete: (userId) => api.delete(`/api/user/${userId}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/api/booking/create', data),
  complete: (bookingId, data) => api.post(`/api/booking/complete/${bookingId}`, data),
  cancel: (bookingId, data) => api.post(`/api/booking/cancel/${bookingId}`, data),
  getByWaitingListId: (waitingListId) => api.get(`/api/booking/getByWaitingListId/${waitingListId}`),
  getByUser: (userId) => api.get(`/api/booking/getByUser/${userId}`),
  getByStatus: (statusList) => api.get(`/api/booking/getByStatus/${statusList}`),
  getByStation: (stationId) => api.get(`/api/booking/getByStation/${stationId}`),
  getByPost: (postId) => api.get(`/api/booking/getByPost/${postId}`),
  getByCreatedDate: () => api.get('/api/booking/getByCreatedDate'),
  getByBookingId: (bookingId) => api.get(`/api/booking/getByBookingId/${bookingId}`),
};
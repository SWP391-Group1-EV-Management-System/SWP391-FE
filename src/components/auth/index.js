/**
 * Auth Components Index
 *
 * Xuất tất cả các component liên quan đến authentication
 * để dễ dàng import trong các file khác
 */

// Main protected route component
export { default as ProtectedRoute } from "./ProtectedRoute.jsx";

// Role-based route components
export { AdminRoute, StaffRoute, ManagerRoute, DriverRoute } from "./AdminRoute.jsx";

// Root redirect component
export { default as RootRedirect } from "./RootRedirect.jsx";

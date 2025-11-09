import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const res = await api.post("/users/re-login");
    // Backend trả về string "Tạo mới token thành công"
    console.log("Refresh token thành công:", res.data);
    return res.data;
  } catch (error) {
    console.error("Refresh token thất bại:", error.response?.status);
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // KHÔNG retry cho các endpoint public (login, re-login, register, etc.)
    const publicEndpoints = [
      "/users/login",
      "/users/re-login",
      "/users/register",
      "/users/send-otp",
      "/users/verify-otp",
      "/users/forgot-password",
      "/users/reset-password",
    ];
    if (
      publicEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint)
      )
    ) {
      console.log("⏭️ Public endpoint, không retry:", originalRequest.url);
      return Promise.reject(error);
    }

    // Chỉ xử lý 401 hoặc 403 và chưa retry
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      // Check xem có phải token expired không
      const errorData = error.response.data;
      const isTokenExpired =
        (typeof errorData === "string" &&
          (errorData.includes("Token expired") ||
            errorData.includes("Invalid token") ||
            errorData.includes("JWT expired") ||
            errorData.includes("Unauthorized"))) ||
        errorData?.error === "Token expired" ||
        errorData?.error === "Invalid token";

      // Nếu là 403, có thể do token hết hạn → Thử refresh
      if (error.response?.status === 403 || isTokenExpired) {
        console.log("🔑 Token có thể hết hạn (401/403), thử refresh...");
      } else {
        // Không phải token expired → Có thể là unauthorized khác (CORS, permissions)
        console.warn(
          "⚠️ 403 Forbidden - Có thể là CORS hoặc không có quyền truy cập"
        );
        console.warn("URL:", originalRequest.url);
        console.warn("Response:", errorData);

        // Nếu là /users/me và 403, có thể user chưa login → redirect về login
        if (originalRequest.url?.includes("/users/me")) {
          console.log("🚨 Không thể lấy thông tin user, có thể chưa đăng nhập");
          // Không redirect tự động ở đây, để component xử lý
        }

        return Promise.reject(error);
      }

      // Nếu đang refresh, thêm vào queue
      if (isRefreshing) {
        console.log("⏳ Đang refresh token, thêm request vào queue...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log(
              "♻️ Retry request sau khi refresh:",
              originalRequest.url
            );
            return api(originalRequest);
          })
          .catch((err) => {
            console.error("❌ Retry thất bại:", err.message);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Bắt đầu refresh token...");
        await refreshAccessToken();

        // Refresh thành công → Retry tất cả requests
        processQueue(null);

        console.log(
          "✅ Refresh thành công, retry request gốc:",
          originalRequest.url
        );
        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "❌ Refresh token thất bại:",
          refreshError.response?.status
        );

        // Refresh thất bại → Clear queue và logout
        processQueue(refreshError);

        // KHÔNG redirect tự động về login nữa
        // Để các component tự xử lý (RootRedirect, ProtectedRoute, etc.)
        console.warn("⚠️ Refresh token thất bại - để component xử lý redirect");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { refreshAccessToken };

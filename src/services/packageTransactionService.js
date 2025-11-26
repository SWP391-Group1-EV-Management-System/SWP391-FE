import api from "../utils/axios";
export const getUserPackageTransactions = async (userId) => {
  const response = await api.get(`/api/packageTransaction/user/${userId}`);
  return response.data;
};

export const getActivePackageTransaction = async (userId) => {
  const transactions = await getUserPackageTransactions(userId);
  return transactions.find((t) => t.status === "ACTIVE") || null;
};

export const cancelPackageTransaction = async (packageTransactionId) => {
  if (!packageTransactionId) throw new Error("Missing packageTransactionId");
  // Accept 2xx and 4xx responses so we can inspect server body even when status is 403
  const response = await api.delete(
    `/api/packageTransaction/cancel/${packageTransactionId}`,
    {
      validateStatus: (status) => status >= 200 && status < 500,
    }
  );

  // If server returned 200, treat as success
  if (response.status === 200) return response.data;

  // If server returned 403 but included a success message (some backends mis-configure status),
  // return the response object so caller can decide how to handle it.
  if (response.status === 403) {
    return { __status: 403, data: response.data };
  }

  // For other statuses, throw so caller's error handling executes
  const err = new Error("Request failed with status " + response.status);
  err.response = response;
  throw err;
};

export default {
  getUserPackageTransactions,
  getActivePackageTransaction,
  cancelPackageTransaction,
};

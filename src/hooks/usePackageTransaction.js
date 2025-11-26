// hooks/usePackageTransaction.js
import { useState, useCallback } from "react";
import {
  getUserPackageTransactions,
  getActivePackageTransaction,
  cancelPackageTransaction,
} from "../services/packageTransactionService";

// Hook quản lý package transaction
export const usePackageTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy tất cả package transactions của user
  const fetchUserTransactions = useCallback(async (userId) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getUserPackageTransactions(userId);
      setTransactions(data);

      const active = data.find((t) => t.status === "ACTIVE");
      setActiveTransaction(active || null);

      return data;
    } catch (err) {
      setError(err.response?.data || err.message);
      setTransactions([]);
      setActiveTransaction(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy transaction đang ACTIVE
  const fetchActiveTransaction = useCallback(async (userId) => {
    if (!userId) return null;

    setLoading(true);
    setError(null);
    try {
      const active = await getActivePackageTransaction(userId);
      setActiveTransaction(active);
      return active;
    } catch (err) {
      setError(err.response?.data || err.message);
      setActiveTransaction(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy transaction đang hoạt động
  const cancelTransaction = useCallback(async (packageTransactionId) => {
    if (!packageTransactionId) throw new Error("Missing packageTransactionId");
    setLoading(true);
    setError(null);
    try {
      const res = await cancelPackageTransaction(packageTransactionId);

      // cancelPackageTransaction may return { __status: 403, data } when backend
      // returns 403 but includes a success message. Detect success heuristically.
      let cancelled = false;
      if (res && res.__status === 403) {
        const body = res.data;
        const bodyStr =
          typeof body === "string" ? body : JSON.stringify(body || "");
        cancelled = /cancel|cancelled|success|thành công/i.test(bodyStr);
      } else {
        // assume 2xx success
        cancelled = true;
      }

      if (!cancelled) {
        const err = new Error("Failed to cancel package transaction");
        err.response = res;
        throw err;
      }

      // Update local state to remove the cancelled transaction and clear active
      setTransactions((prev) =>
        prev.filter((t) => {
          const ids = [t.packageTransactionId, t.id, t.transactionId].filter(
            Boolean
          );
          return !ids.includes(packageTransactionId);
        })
      );
      setActiveTransaction(null);

      // Do NOT automatically re-fetch from server here to avoid triggering
      // an immediate GET that may return 403 in some environments. Caller
      // can call fetchUserTransactions explicitly if a full refresh is needed.
      return true;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    activeTransaction,
    loading,
    error,
    fetchUserTransactions,
    fetchActiveTransaction,
    cancelTransaction,
  };
};

export default usePackageTransaction;

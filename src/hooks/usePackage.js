import { useState, useCallback } from 'react';
import * as packageService from '../services/packageService';

// Helper to normalize id fields from various backend shapes and return as string
const getId = (item) => {
  const id = item?.packageId ?? item?.id ?? item?._id ?? null;
  return id != null ? String(id) : null;
};

const usePackage = () => {
  const [packages, setPackages] = useState([]);
  const [packageItem, setPackageItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.getAllServicePackages();
      // ensure each item has a packageId for stable keys
      setPackages(Array.isArray(data) ? data.map((item, idx) => ({ ...item, packageId: getId(item) ?? `auto-${Date.now()}-${idx}` })) : []);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (packageId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.getServicePackage(packageId);
      // normalize fetched item id
      setPackageItem(data ? { ...data, packageId: getId(data) ?? (packageId != null ? String(packageId) : null) } : data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.createServicePackage(payload);
      const normalized = { ...data, packageId: getId(data) ?? getId(payload) ?? `auto-${Date.now()}` };
      // append to cached list
      setPackages((prev) => (prev ? [ ...prev, normalized ] : [normalized]));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (packageId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.updateServicePackage(packageId, payload);
      const normId = packageId ?? getId(payload);
      const normalizedData = data ? { ...data, packageId: getId(data) ?? normId } : data;
      // Update cached list and item if present
      setPackages((prev) => (prev ? prev.map(p => (getId(p) === normId ? normalizedData : p)) : prev));
      setPackageItem((prev) => (prev && getId(prev) === normId ? normalizedData : prev));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (packageId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.deleteServicePackage(packageId);
      const idToRemove = packageId != null ? String(packageId) : packageId;
      setPackages((prev) => (prev ? prev.filter(p => getId(p) !== idToRemove) : prev));
      setPackageItem((prev) => (prev && getId(prev) === idToRemove ? null : prev));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    packages,
    packageItem,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
};

export default usePackage;

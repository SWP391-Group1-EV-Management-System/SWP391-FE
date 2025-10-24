// File: src/hooks/carApi.js (hoặc src/services/carApi.js)
import { useState, useCallback } from 'react';
import * as carService from '../services/carService';

const useCar = () => {
  const [cars, setCars] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getAllCars();
      setCars(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCarsByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getCarsByUser(userId);
      setCars(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCar = useCallback(async (carId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getCar(carId);
      setCar(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCar = useCallback(async (carData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await carService.addCar(carData);
      setCars((prev) => (prev ? [created, ...prev] : [created]));
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyCar = useCallback(async (carId, carData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await carService.updateCar(carId, carData);
      setCars((prev) => prev.map((c) => (c.id === carId || c._id === carId ? updated : c)));
      setCar((prev) => (prev && (prev.id === carId || prev._id === carId) ? updated : prev));
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCar = useCallback(async (carId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await carService.deleteCar(carId);
      setCars((prev) => prev.filter((c) => !(c.id === carId || c._id === carId)));
      if (car && (car.id === carId || car._id === carId)) setCar(null);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [car]);

  return {
    cars,
    car,
    loading,
    error,
    fetchAllCars,
    fetchCarsByUser,
    getCarsByUser: fetchCarsByUser,
    fetchCar,
    createCar,
    modifyCar,
    removeCar,
  };
};

export default useCar;
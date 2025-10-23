import { useState } from 'react';
import {
  addCar as apiAddCar,
  updateCar as apiUpdateCar,
  getCar as apiGetCar,
  getCarsByUser as apiGetCarsByUser,
  deleteCar as apiDeleteCar,
  getAllCars as apiGetAllCars,
} from '../hooks/useCar'; // Import from hooks folder where carService functions are

const useCar = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    addCar: (carData) => handleApiCall(apiAddCar, carData),
    updateCar: (carId, carData) => handleApiCall(apiUpdateCar, carId, carData),
    getCar: (carId) => handleApiCall(apiGetCar, carId),
    getCarsByUser: (userId) => handleApiCall(apiGetCarsByUser, userId),
    deleteCar: (carId) => handleApiCall(apiDeleteCar, carId),
    getAllCars: () => handleApiCall(apiGetAllCars),
  };
};

export default useCar;
import { useState, useCallback } from 'react';
import * as carService from '../services/carService';

const useCar = () => {
  const [cars, setCars] = useState([]);
  const [car, setCar] = useState(null);
  const [carDataList, setCarDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy tất cả xe
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

  // Lấy danh sách xe theo user
  const fetchCarsByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getCarsByUser(userId);
      
      // Đảm bảo mỗi xe có carID để làm key
      const carsWithIds = data.map((car, index) => ({
        ...car,
        carID: car.carID || car.id || `temp-${index}`,
      }));
      
      setCars(carsWithIds);
      return carsWithIds;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết 1 xe
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

  // Lấy danh sách xe có sẵn từ database (car_data)
  const fetchAllCarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getAllCarData();
      setCarDataList(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo xe mới
  const createCar = useCallback(async (carData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await carService.addCar(carData);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật xe
  const modifyCar = useCallback(async (carId, carData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await carService.updateCar(carId, carData);
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa xe
  const removeCar = useCallback(async (carId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await carService.deleteCar(carId);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //For ADMIN functions can be added here similarly
  
  const createReportCar = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const createdReport = await carService.createReportCar(reportData);
      return createdReport;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiscensePlates = useCallback(async (licensePlate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getLiscensePlates(licensePlate);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChassisNumber = useCallback(async (chassisNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getChassisNumber(chassisNumber);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await carService.getAllReport();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    cars,
    car,
    carDataList,
    loading,
    error,
    fetchAllReports,
    createReportCar,
    fetchLiscensePlates,
    fetchChassisNumber,
    fetchAllCars,
    fetchCarsByUser,
    getCarsByUser: fetchCarsByUser,
    fetchCar,
    fetchAllCarData,
    createCar,
    modifyCar,
    removeCar,
  };
};

export default useCar;
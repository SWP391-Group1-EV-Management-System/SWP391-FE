import api from '../utils/axios';

export const addCar = async (carData) => {
  try {
    const response = await api.post('/api/car/add', carData);
    return response.data;
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

export const updateCar = async (carId, carData) => {
  try {
    const response = await api.put(`/api/car/update/${carId}`, carData);
    return response.data;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const getCar = async (carId) => {
  try {
    const response = await api.get(`/api/car/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
};

export const getCarsByUser = async (userId) => {
  try {
    const response = await api.get(`/api/car/all/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cars by user:', error);
    throw error;
  }
};

export const deleteCar = async (carId) => {
  try {
    const response = await api.delete(`/api/car/delete/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

export const getAllCars = async () => {
  try {
    const response = await api.get('/api/car/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all cars:', error);
    throw error;
  }
};
import api from '../utils/axios';
//DRIVER FUNCTIONS
export const addCar = async (carData) => {
  try {
    const response = await api.post('/api/car/addForUser', carData);
    return response.data;
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

export const updateCar = async (carId, carData) => {
  try {
    const response = await api.put(`/api/car/user/update/${carId}`, carData);
    return response.data;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

export const getCar = async (carId) => {
  try {
    const response = await api.get(`/api/car/carId/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
};

export const getCarsByUser = async (userId) => {
  try {
    const response = await api.get(`/api/car/allForUser/${userId}`);
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

export const getAllCarData = async () => {
  try {
    const response = await api.get('/api/car_data/all'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching all car data:', error);
    throw error;
  }
};

//ADMIN FUNCTIONS
export const getAllCars = async () => {
  try {
    const response = await api.get('/api/car/allForAdmin');
    return response.data;
  } catch (error) {
    console.error('Error fetching all cars:', error);
    throw error;
  }
};


export const getLiscensePlates = async (licensePlate) => {
  try {
    const response = await api.get(`/api/car/license_plate/${licensePlate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching license plates:', error);
    throw error;
  }
};

export const getChassisNumber = async (chassisNumber) => {
  try {
    const response = await api.get(`/api/car/chassis_number/${chassisNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chassis number:', error);
    throw error;
  }
};

export const createReportCar = async (reportData) => {
  try {
    const response = await api.post('/reports/create', reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating report car:', error);
    throw error;
  }
};

export const getAllReport = async () => {
  try {
    const response = await api.get('/reports/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw error;
  }
};
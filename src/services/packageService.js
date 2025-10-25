import api from '../utils/axios';
export const getServicePackage = async (servicePackageId) => {
    try {
      const response = await api.get(`/api/servicePackage/getServiceById/${servicePackageId}`);
      return response.data;
    } catch (error) {
      console.error('[servicePackage]  getServicePackage error:', error);
      throw error;
    }
};

export const getAllServicePackages = async () => {
    try {
      const response = await api.get('api/servicePackage/getAllPackage');   
        return response.data;
    } catch (error) {
        console.error('[servicePackage]  getAllServicePackages error:', error); 
        throw error;
    }
};
export const createServicePackage = async (servicePackageData) => {
    try {
      const response = await api.post('/api/servicePackage/create', servicePackageData);
      return response.data;
    } catch (error) {
      console.error('[servicePackage]  createServicePackage error:', error);
      throw error;
    } 
};

export const updateServicePackage = async (servicePackageId, servicePackageData) => {
    try {
      const response = await api.put(`/api/servicePackage/update/${servicePackageId}`, servicePackageData);
      return response.data;
    } catch (error) {
      console.error('[servicePackage]  updateServicePackage error:', error);
      throw error;
    } 
};

export const deleteServicePackage = async (servicePackageId) => {
    try {
      const response = await api.delete(`/api/servicePackage/delete/${servicePackageId}`);  
        return response.data;
    } catch (error) {
        console.error('[servicePackage]  deleteServicePackage error:', error); 
        throw error;
    }
};
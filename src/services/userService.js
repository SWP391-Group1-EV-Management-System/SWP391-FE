import api from "../utils/axios";

export const getDrivers = async () => {
  try {
    const response = await api.get("/api/users/getUserByRole/Driver");
    return response.data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export const getStaff = async () => {
  try {
    const response = await api.get("/api/users/getUserByRole/Staff");
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/api/users/getAllUsers");
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/getUser/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post("/api/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/update/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Update profile for the authenticated user (new API)
export const updateProfile = async (userId, profileData) => {
  try {
    // Ensure payload only contains allowed fields
    const payload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      // backend expects boolean for gender
      gender: typeof profileData.gender === 'boolean' ? profileData.gender : undefined,
      phone: profileData.phone,
    };
    // Remove undefined fields
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const response = await api.put(`/api/users/updateProfile/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Update password for user
export const updatePassword = async (userId, passwordPayload) => {
  try {
    const response = await api.put(`/api/users/updatePassword/${userId}`, passwordPayload);
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getUserStatus = async (userId) => {
  try {
    const response = await api.get(`/api/users/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw error;
  }
};

export const getBookingTime = async (userId) => {
  try {
    const response = await api.get(`/api/users/bookingTime/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookingTime:", error);
    throw error;
  }
};

export const createStaff = async (staffData) => {
  try {
    const response = await api.post("/users/register/create-staff", {
      email: staffData.email,
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      birthDate: staffData.birthDate,
      gender: staffData.gender,
      phoneNumber: staffData.phoneNumber,
      password: staffData.password,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
};

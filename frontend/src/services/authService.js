import api from "./api";

export const authService = {
  signup: async (userData) => {
    const response = await api.post("/user/signup", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/user/login", credentials);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/user/refresh");
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post("/user/upload-profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

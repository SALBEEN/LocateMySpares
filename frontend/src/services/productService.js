import api from "./api";

export const productService = {
  getAllProducts: async (search = "", category = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "All") params.append("category", category);

    const response = await api.get(`/product/all?${params.toString()}`);
    return response.data;
  },

  getSingleProduct: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  createProduct: async (productFormData) => {
    // Note: Ensure your multer middleware on the backend appends the URL
    // to req.body.imageUrl before saving to the Product model.
    const response = await api.post("/product/create", productFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProduct: async (id, updateData) => {
    const response = await api.put(`/product/${id}`, updateData);
    return response.data;
  },

  toggleAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/product/${id}/toggle-availability`, {
      isAvailable,
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get("/product/my-inventory");
    return response.data;
  },
};

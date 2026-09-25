import api from "./api";

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post("/order/create", orderData);
    return response.data;
  },

  getIncomingOrders: async () => {
    const response = await api.get("/order/incoming-orders");
    return response.data;
  },

  getMyRentals: async () => {
    const response = await api.get("/order/my-rentals");
    return response.data;
  },

  updateOrderStatus: async (orderId, status, notes = "") => {
    const response = await api.patch("/order/status", {
      orderId,
      status,
      notes,
    });
    return response.data;
  },

  getLenderStats: async (lenderId) => {
    const response = await api.get(`/order/stats/${lenderId}`);
    return response.data;
  },
};

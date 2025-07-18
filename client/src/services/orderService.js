import axios from "axios";

const API_BASE = "/api/v1";

export const createOrder = async (orderData, token) => {
  const res = await axios.post(`${API_BASE}/orders`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data.order;
};

export const createRazorpayOrder = async (orderId, token) => {
  const res = await axios.post(
    `${API_BASE}/payments/create-order`,
    { orderId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

export const verifyRazorpayPayment = async (paymentData, token) => {
  const res = await axios.post(`${API_BASE}/payments/verify`, paymentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

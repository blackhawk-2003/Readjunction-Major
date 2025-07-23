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

export const getBuyerOrders = async (
  token,
  { page = 1, limit = 10, status } = {}
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page);
  params.append("limit", limit);
  const res = await axios.get(`/api/v1/orders/my-orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const getOrderById = async (orderId, token) => {
  const res = await axios.get(`/api/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data.order;
};

// ADMIN: Get all orders (paginated, filterable)
export const getAllOrders = async (
  token,
  {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    sellerId,
    buyerId,
    startDate,
    endDate,
  } = {}
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (paymentStatus) params.append("paymentStatus", paymentStatus);
  if (sellerId) params.append("sellerId", sellerId);
  if (buyerId) params.append("buyerId", buyerId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("page", page);
  params.append("limit", limit);
  const res = await axios.get(
    `${API_BASE}/orders/admin/orders?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

// ADMIN: Update order status
export const adminUpdateOrderStatus = async (
  orderId,
  status,
  token,
  { note, trackingNumber, estimatedDelivery } = {}
) => {
  const body = { status };
  if (note) body.note = note;
  if (trackingNumber) body.trackingNumber = trackingNumber;
  if (estimatedDelivery) body.estimatedDelivery = estimatedDelivery;
  const res = await axios.patch(
    `${API_BASE}/orders/admin/${orderId}/status`,
    body,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data.order;
};

// ADMIN: Get order by ID (with all details)
export const adminGetOrderById = async (orderId, token) => {
  const res = await axios.get(`${API_BASE}/orders/admin/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data.order;
};

// ADMIN: Update payment status
export const adminUpdatePaymentStatus = async (
  orderId,
  status,
  token,
  { transactionId, gateway } = {}
) => {
  const body = { status };
  if (transactionId) body.transactionId = transactionId;
  if (gateway) body.gateway = gateway;
  const res = await axios.patch(
    `${API_BASE}/orders/admin/${orderId}/payment`,
    body,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data.order;
};

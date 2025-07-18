const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Seller = require("../models/seller.model");
const { ApiError } = require("../utils");
const { asyncHandler } = require("../utils");

// Helper function to calculate order totals
const calculateOrderTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: shippingCost,
    discount: 0,
    total: Math.round(total * 100) / 100,
  };
};

// Helper function to validate product availability
const validateProductAvailability = async (items) => {
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).populate("sellerId");

    if (!product) {
      throw new ApiError(404, `Product with ID ${item.productId} not found`);
    }

    if (product.status !== "active" || product.approvalStatus !== "approved") {
      throw new ApiError(
        400,
        `Product ${product.title} is not available for purchase`
      );
    }

    if (product.inventory.quantity < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for product ${product.title}. Available: ${product.inventory.quantity}`
      );
    }

    validatedItems.push({
      productId: product._id,
      sellerId: product.sellerId._id,
      quantity: item.quantity,
      price: product.price,
      productName: product.title,
      productImage: product.images[0] || "",
      sellerName:
        product.sellerId?.businessInfo?.businessName ||
        product.sellerId?.businessName ||
        "Unknown Seller",
    });
  }

  return validatedItems;
};

// Helper function to update product inventory
const updateProductInventory = async (items, operation = "decrease") => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      if (operation === "decrease") {
        product.inventory.quantity -= item.quantity;
        product.inventory.sold += item.quantity;
      } else if (operation === "increase") {
        product.inventory.quantity += item.quantity;
        product.inventory.sold -= item.quantity;
      }
      await product.save();
    }
  }
};

// Create a new order
const createOrder = asyncHandler(async (req, res) => {
  const { items, payment, shipping, notes } = req.body;
  const buyerId = req.user._id;

  // Validate and get product details
  const validatedItems = await validateProductAvailability(items);

  // Calculate shipping cost based on method
  const shippingCosts = {
    standard: 50,
    express: 100,
    overnight: 200,
  };
  const shippingCost = shippingCosts[shipping.method] || 50;

  // Calculate order totals
  const totals = calculateOrderTotals(validatedItems, shippingCost);

  // Create order
  const order = new Order({
    buyerId,
    items: validatedItems,
    payment: {
      method: payment.method,
      amount: totals.total,
    },
    shipping: {
      address: shipping.address,
      method: shipping.method,
      cost: shippingCost,
    },
    totals,
    notes,
  });

  // Fallback: generate orderNumber if not set by pre-save hook
  if (!order.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    order.orderNumber = `RJ${year}${month}${day}${random}`;
  }

  await order.save();

  // Update product inventory
  await updateProductInventory(validatedItems, "decrease");

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: {
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.totals.total,
        items: order.items,
        shipping: order.shipping,
        payment: order.payment,
        createdAt: order.createdAt,
      },
    },
  });
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId)
    .populate("buyerId", "name email phone")
    .populate("items.productId", "title images category")
    .populate("items.sellerId", "businessInfo.businessName");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check access permissions
  if (
    userRole === "buyer" &&
    order.buyerId._id.toString() !== userId.toString()
  ) {
    throw new ApiError(
      403,
      "Access denied. You can only view your own orders."
    );
  }

  if (userRole === "seller") {
    const hasAccess = order.items.some(
      (item) => item.sellerId._id.toString() === userId.toString()
    );
    if (!hasAccess) {
      throw new ApiError(
        403,
        "Access denied. You can only view orders containing your products."
      );
    }
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

// Get orders for buyer
const getBuyerOrders = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { buyerId, isActive: true };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate("items.productId", "title images category")
    .populate("items.sellerId", "businessInfo.businessName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get orders for seller
const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    "items.sellerId": sellerId,
    isActive: true,
  };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate("buyerId", "name email phone")
    .populate("items.productId", "title images category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get all orders (admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    paymentStatus,
    sellerId,
    buyerId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { isActive: true };

  if (status) query.status = status;
  if (paymentStatus) query["payment.status"] = paymentStatus;
  if (sellerId) query["items.sellerId"] = sellerId;
  if (buyerId) query.buyerId = buyerId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate("buyerId", "name email phone")
    .populate("items.productId", "title images category")
    .populate("items.sellerId", "businessInfo.businessName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note, trackingNumber, estimatedDelivery } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check permissions
  if (userRole === "buyer") {
    if (order.buyerId.toString() !== userId.toString()) {
      throw new ApiError(403, "Access denied");
    }
    // Buyers can only cancel their own orders
    if (status !== "cancelled") {
      throw new ApiError(403, "Buyers can only cancel orders");
    }
  }

  if (userRole === "seller") {
    const hasAccess = order.items.some(
      (item) => item.sellerId.toString() === userId.toString()
    );
    if (!hasAccess) {
      throw new ApiError(
        403,
        "Access denied. You can only update orders containing your products."
      );
    }
    // Sellers can update status for their items
    const allowedStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
    ];
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(
        403,
        "Sellers can only update status to: confirmed, processing, shipped, out_for_delivery"
      );
    }
  }

  // Update order
  const updateData = { status };
  if (note) updateData["notes.seller"] = note;
  if (trackingNumber) updateData["shipping.trackingNumber"] = trackingNumber;
  if (estimatedDelivery)
    updateData["shipping.estimatedDelivery"] = estimatedDelivery;

  // Set specific timestamps
  if (status === "shipped") {
    updateData["shipping.shippedAt"] = new Date();
  } else if (status === "delivered") {
    updateData["shipping.deliveredAt"] = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("buyerId", "name email phone")
    .populate("items.productId", "title images category")
    .populate("items.sellerId", "businessInfo.businessName");

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: { order: updatedOrder },
  });
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order can be cancelled
  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new ApiError(
      400,
      `Order cannot be cancelled in ${order.status} status`
    );
  }

  // Check permissions
  if (userRole === "buyer") {
    if (order.buyerId.toString() !== userId.toString()) {
      throw new ApiError(403, "Access denied");
    }
  } else if (userRole === "seller") {
    const hasAccess = order.items.some(
      (item) => item.sellerId.toString() === userId.toString()
    );
    if (!hasAccess) {
      throw new ApiError(403, "Access denied");
    }
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "cancelled",
      cancellationReason: reason,
      "notes.seller": reason,
    },
    { new: true, runValidators: true }
  );

  // Restore product inventory
  await updateProductInventory(order.items, "increase");

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: { order: updatedOrder },
  });
});

// Process refund
const processRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason, amount } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order can be refunded
  if (order.status !== "delivered") {
    throw new ApiError(
      400,
      "Order must be delivered before refund can be processed"
    );
  }

  if (order.payment.status === "refunded") {
    throw new ApiError(400, "Order has already been refunded");
  }

  // Check permissions (only admin and seller can process refunds)
  if (userRole === "buyer") {
    throw new ApiError(403, "Buyers cannot process refunds");
  }

  if (userRole === "seller") {
    const hasAccess = order.items.some(
      (item) => item.sellerId.toString() === userId.toString()
    );
    if (!hasAccess) {
      throw new ApiError(403, "Access denied");
    }
  }

  // Calculate refund amount
  const refundAmount = amount || order.totals.total;

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "refunded",
      refundReason: reason,
      "payment.status": "refunded",
      "notes.admin": reason,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    data: {
      order: updatedOrder,
      refundAmount,
    },
  });
});

// Process return
const processReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason, items } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order can be returned
  if (order.status !== "delivered") {
    throw new ApiError(
      400,
      "Order must be delivered before return can be processed"
    );
  }

  // Check permissions (only buyers can initiate returns)
  if (userRole !== "buyer") {
    throw new ApiError(403, "Only buyers can initiate returns");
  }

  if (order.buyerId.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Validate return items
  const returnItems = [];
  for (const returnItem of items) {
    const orderItem = order.items.find(
      (item) => item.productId.toString() === returnItem.productId
    );

    if (!orderItem) {
      throw new ApiError(
        400,
        `Product ${returnItem.productId} not found in order`
      );
    }

    if (returnItem.quantity > orderItem.quantity) {
      throw new ApiError(
        400,
        `Return quantity cannot exceed ordered quantity for product ${returnItem.productId}`
      );
    }

    returnItems.push({
      ...returnItem,
      originalQuantity: orderItem.quantity,
      price: orderItem.price,
    });
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "returned",
      returnReason: reason,
      "notes.buyer": reason,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Return processed successfully",
    data: {
      order: updatedOrder,
      returnItems,
    },
  });
});

// Update payment status
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, transactionId, gateway } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check permissions (only admin can update payment status)
  if (userRole !== "admin") {
    throw new ApiError(403, "Only admins can update payment status");
  }

  // Update payment
  const updateData = { "payment.status": status };
  if (transactionId) updateData["payment.transactionId"] = transactionId;
  if (gateway) updateData["payment.gateway"] = gateway;
  if (status === "completed") {
    updateData["payment.paidAt"] = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Payment status updated successfully",
    data: { order: updatedOrder },
  });
});

// Get order statistics (admin only)
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = { isActive: true };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    totalItems,
  ] = await Promise.all([
    Order.countDocuments(query),
    Order.countDocuments({ ...query, status: "pending" }),
    Order.countDocuments({ ...query, status: "confirmed" }),
    Order.countDocuments({ ...query, status: "processing" }),
    Order.countDocuments({ ...query, status: "shipped" }),
    Order.countDocuments({ ...query, status: "delivered" }),
    Order.countDocuments({ ...query, status: "cancelled" }),
    Order.aggregate([
      { $match: { ...query, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totals.total" } } },
    ]),
    Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: "$items.quantity" } } },
    ]),
  ]);

  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
  const items = totalItems.length > 0 ? totalItems[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: revenue,
        totalItems: items,
        averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
      },
    },
  });
});

// Delete order (admin only - soft delete)
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Soft delete
  await Order.findByIdAndUpdate(orderId, { isActive: false });

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

module.exports = {
  createOrder,
  getOrderById,
  getBuyerOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  processReturn,
  updatePaymentStatus,
  getOrderStats,
  deleteOrder,
};

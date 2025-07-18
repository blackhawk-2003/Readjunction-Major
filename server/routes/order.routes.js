const express = require("express");
const router = express.Router();

// Import controllers
const {
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
} = require("../controllers/order.controller");

// Import middleware
const { protect, authorize } = require("../middleware/auth.js");
const validate = require("../middleware/validate.js");

// Import validators
const {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  refundOrderSchema,
  returnOrderSchema,
  updatePaymentStatusSchema,
  adminOrderQuerySchema,
  buyerOrderQuerySchema,
  sellerOrderQuerySchema,
} = require("../validators/order.validator");

// ==================== BUYER ROUTES ====================
// Create a new order
router.post(
  "/",
  protect,
  authorize("buyer"),
  validate(createOrderSchema),
  createOrder
);

// Get buyer's orders
router.get(
  "/my-orders",
  protect,
  authorize("buyer"),
  validate(buyerOrderQuerySchema, "query"),
  getBuyerOrders
);

// Get specific order by ID (buyer can only view their own orders)
router.get("/:orderId", protect, authorize("buyer"), getOrderById);

// Cancel order (buyer can only cancel their own orders)
router.patch(
  "/:orderId/cancel",
  protect,
  authorize("buyer"),
  validate(cancelOrderSchema),
  cancelOrder
);

// Update order status (buyer can only cancel)
router.patch(
  "/:orderId/status",
  protect,
  authorize("buyer"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// Process return (buyer can initiate returns)
router.patch(
  "/:orderId/return",
  protect,
  authorize("buyer"),
  validate(returnOrderSchema),
  processReturn
);

// ==================== SELLER ROUTES ====================
// Get seller's orders
router.get(
  "/seller/orders",
  protect,
  authorize("seller"),
  validate(sellerOrderQuerySchema, "query"),
  getSellerOrders
);

// Get specific order by ID (seller can view orders containing their products)
router.get("/seller/:orderId", protect, authorize("seller"), getOrderById);

// Update order status (seller can update status for their products)
router.patch(
  "/seller/:orderId/status",
  protect,
  authorize("seller"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// Cancel order (seller can cancel orders containing their products)
router.patch(
  "/seller/:orderId/cancel",
  protect,
  authorize("seller"),
  validate(cancelOrderSchema),
  cancelOrder
);

// Process refund (seller can process refunds for their products)
router.patch(
  "/seller/:orderId/refund",
  protect,
  authorize("seller"),
  validate(refundOrderSchema),
  processRefund
);

// ==================== ADMIN ROUTES ====================
// Get all orders (admin can view all orders)
router.get(
  "/admin/orders",
  protect,
  authorize("admin"),
  validate(adminOrderQuerySchema, "query"),
  getAllOrders
);

// Get specific order by ID (admin can view any order)
router.get("/admin/:orderId", protect, authorize("admin"), getOrderById);

// Update order status (admin can update any order status)
router.patch(
  "/admin/:orderId/status",
  protect,
  authorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// Cancel order (admin can cancel any order)
router.patch(
  "/admin/:orderId/cancel",
  protect,
  authorize("admin"),
  validate(cancelOrderSchema),
  cancelOrder
);

// Process refund (admin can process refunds)
router.patch(
  "/admin/:orderId/refund",
  protect,
  authorize("admin"),
  validate(refundOrderSchema),
  processRefund
);

// Update payment status (admin only)
router.patch(
  "/admin/:orderId/payment",
  protect,
  authorize("admin"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

// Get order statistics (admin only)
router.get("/admin/stats", protect, authorize("admin"), getOrderStats);

// Delete order (admin only - soft delete)
router.delete("/admin/:orderId", protect, authorize("admin"), deleteOrder);

module.exports = router;

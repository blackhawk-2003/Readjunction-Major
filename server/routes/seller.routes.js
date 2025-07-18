const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getSellerAnalytics,
  getSellerProducts,
  getSellerOrders,
} = require("../controllers/seller.controller");

// Apply auth middleware to all seller routes
router.use(protect);

// Get seller analytics/dashboard stats
router.get("/analytics", getSellerAnalytics);

// Get seller products
router.get("/products", getSellerProducts);

// Get seller orders
router.get("/orders", getSellerOrders);

module.exports = router;

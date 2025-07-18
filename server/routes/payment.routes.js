const express = require("express");
const router = express.Router();

// Import controllers
const PaymentController = require("../controllers/payment.controller");

// Import middleware
const { protect } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

// Razorpay Payment Routes
router.post("/create-order", PaymentController.createRazorpayOrder);
router.post("/verify", PaymentController.verifyPayment);

// Refund and Payment Details Routes
router.post("/refund", PaymentController.processRefund);
router.get("/:orderId", PaymentController.getPaymentDetails);

module.exports = router;

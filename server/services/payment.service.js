const Razorpay = require("razorpay");
const crypto = require("crypto");
const { ApiError, asyncHandler } = require("../utils");

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay configuration error: Missing API keys");
  console.error(
    "RAZORPAY_KEY_ID:",
    process.env.RAZORPAY_KEY_ID ? "Set" : "Missing"
  );
  console.error(
    "RAZORPAY_KEY_SECRET:",
    process.env.RAZORPAY_KEY_SECRET ? "Set" : "Missing"
  );
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log(
  "Razorpay initialized with key_id:",
  process.env.RAZORPAY_KEY_ID ? "Set" : "Missing"
);

/**
 * Payment Service
 * Handles all payment-related operations using Razorpay
 */
class PaymentService {
  /**
   * Create a Razorpay order
   * @param {Object} order - Order object
   * @param {string} currency - Currency code (default: 'INR')
   * @returns {Object} Razorpay order
   */
  static async createRazorpayOrder(order, currency = "INR") {
    try {
      console.log("PaymentService: Creating Razorpay order with options:", {
        amount: Math.round(order.totals.total * 100),
        currency,
        receipt: order.orderNumber,
        orderId: order._id.toString(),
      });

      const options = {
        amount: Math.round(order.totals.total * 100), // Convert to paise
        currency: currency,
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          buyerId: order.buyerId.toString(),
        },
      };

      console.log(
        "PaymentService: Calling Razorpay SDK with options:",
        options
      );

      const razorpayOrder = await razorpay.orders.create(options);

      console.log("PaymentService: Razorpay SDK response:", razorpayOrder);

      if (!razorpayOrder || !razorpayOrder.id) {
        console.error(
          "PaymentService: Invalid response from Razorpay SDK:",
          razorpayOrder
        );
        throw new Error("Invalid response from Razorpay - missing order ID");
      }

      const result = {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      };

      console.log("PaymentService: Returning result:", result);
      return result;
    } catch (error) {
      console.error("PaymentService: Error creating Razorpay order:", error);

      // Check for specific Razorpay errors
      if (error.message && error.message.includes("key_id")) {
        throw new ApiError(500, "Razorpay API keys are missing or invalid");
      }

      if (error.message && error.message.includes("amount")) {
        throw new ApiError(400, "Invalid order amount");
      }

      if (error.message && error.message.includes("currency")) {
        throw new ApiError(400, "Invalid currency");
      }

      throw new ApiError(
        500,
        `Razorpay order creation failed: ${error.message}`
      );
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {string} razorpayOrderId - Razorpay order ID
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @param {string} razorpaySignature - Razorpay signature
   * @returns {boolean} Signature verification result
   */
  static async verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  ) {
    try {
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpaySignature;

      if (!isAuthentic) {
        throw new ApiError(400, "Invalid payment signature");
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Get Razorpay payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Object} Payment details
   */
  static async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        id: payment.id,
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created: payment.created_at,
        orderId: payment.order_id,
      };
    } catch (error) {
      throw new ApiError(404, `Payment not found: ${error.message}`);
    }
  }

  /**
   * Process refund for a payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund (in currency units, not paise)
   * @param {string} reason - Reason for refund
   * @returns {Object} Refund details
   */
  static async processRefund(
    paymentId,
    amount,
    reason = "requested_by_customer"
  ) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // Convert to paise
        speed: "normal",
        notes: {
          reason: reason,
        },
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.notes?.reason || reason,
      };
    } catch (error) {
      throw new ApiError(500, `Refund processing failed: ${error.message}`);
    }
  }

  /**
   * Get Razorpay order details
   * @param {string} orderId - Razorpay order ID
   * @returns {Object} Order details
   */
  static async getOrderDetails(orderId) {
    try {
      const order = await razorpay.orders.fetch(orderId);
      return {
        id: order.id,
        amount: order.amount / 100, // Convert from paise
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
        notes: order.notes,
        created: order.created_at,
      };
    } catch (error) {
      throw new ApiError(404, `Order not found: ${error.message}`);
    }
  }
}

module.exports = PaymentService;

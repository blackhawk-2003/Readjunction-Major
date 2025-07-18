const PaymentService = require("../services/payment.service");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const { ApiError, ApiResponse, asyncHandler } = require("../utils");

/**
 * Payment Controller
 * Handles all payment-related HTTP requests
 */
class PaymentController {
  /**
   * Create Razorpay order for payment
   * @route POST /api/v1/payments/create-order
   * @access Private (Buyer)
   */
  static createRazorpayOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user._id;

    console.log("Creating Razorpay order for:", { orderId, userId });

    // Validate order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      buyerId: userId,
      isActive: true,
    });

    if (!order) {
      console.log("Order not found:", { orderId, userId });
      throw new ApiError(404, "Order not found");
    }

    console.log("Order found:", {
      orderId: order._id,
      total: order.totals?.total,
    });

    // Check if order is already paid
    if (order.payment.status === "completed") {
      throw new ApiError(400, "Order is already paid");
    }

    try {
      // Create Razorpay order
      const razorpayOrder = await PaymentService.createRazorpayOrder(order);
      console.log("Razorpay order created:", razorpayOrder);

      // Validate razorpayOrder response
      if (!razorpayOrder || !razorpayOrder.razorpayOrderId) {
        console.error("Invalid Razorpay order response:", razorpayOrder);
        throw new ApiError(
          500,
          "Failed to create Razorpay order - invalid response"
        );
      }

      const responseData = {
        orderId: order._id,
        ...razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID,
      };
      console.log("Sending response to frontend:", responseData);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            responseData,
            "Razorpay order created successfully"
          )
        );
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.message && error.message.includes("key_id")) {
        throw new ApiError(
          500,
          "Razorpay configuration error - please check API keys"
        );
      }
      throw new ApiError(500, `Payment setup failed: ${error.message}`);
    }
  });

  /**
   * Verify Razorpay payment and update order
   * @route POST /api/v1/payments/verify
   * @access Private (Buyer)
   */
  static verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;
    const userId = req.user._id;

    // Validate order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      buyerId: userId,
      isActive: true,
    });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Verify payment signature
    await PaymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    // Get payment details from Razorpay
    const paymentDetails = await PaymentService.getPaymentDetails(
      razorpayPaymentId
    );

    // Check if payment is successful
    if (paymentDetails.status !== "captured") {
      throw new ApiError(
        400,
        `Payment not successful. Status: ${paymentDetails.status}`
      );
    }

    // Update order payment status
    await Order.findByIdAndUpdate(orderId, {
      "payment.status": "completed",
      "payment.transactionId": razorpayPaymentId,
      "payment.gateway": "razorpay",
      "payment.paidAt": new Date(),
      status: "confirmed",
      $push: {
        statusHistory: {
          status: "confirmed",
          timestamp: new Date(),
          note: "Razorpay payment completed and order confirmed",
          updatedBy: userId,
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId,
          paymentId: razorpayPaymentId,
          status: "completed",
          amount: paymentDetails.amount,
          method: paymentDetails.method,
        },
        "Payment verified and order confirmed successfully"
      )
    );
  });

  /**
   * Process refund for an order
   * @route POST /api/v1/payments/refund
   * @access Private (Seller/Admin)
   */
  static processRefund = asyncHandler(async (req, res) => {
    const { orderId, amount, reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate order exists
    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check permissions
    if (userRole === "seller") {
      // Seller can only refund orders containing their products
      const hasSellerProducts = order.items.some(
        (item) => item.sellerId.toString() === userId.toString()
      );
      if (!hasSellerProducts) {
        throw new ApiError(
          403,
          "You can only refund orders containing your products"
        );
      }
    } else if (userRole !== "admin") {
      throw new ApiError(403, "Only sellers and admins can process refunds");
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      throw new ApiError(
        400,
        "Refunds can only be processed for delivered orders"
      );
    }

    // Check if payment is completed
    if (order.payment.status !== "completed") {
      throw new ApiError(
        400,
        "Refunds can only be processed for completed payments"
      );
    }

    // Check if already refunded
    if (order.payment.status === "refunded") {
      throw new ApiError(400, "Order has already been refunded");
    }

    // Validate refund amount
    const maxRefundAmount = order.totals.total;
    if (amount > maxRefundAmount) {
      throw new ApiError(
        400,
        `Refund amount cannot exceed order total: ${maxRefundAmount}`
      );
    }

    // Process refund through Razorpay
    const refundResult = await PaymentService.processRefund(
      order.payment.transactionId,
      amount,
      reason
    );

    if (refundResult.success) {
      // Update order status
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": "refunded",
        status: "refunded",
        refundReason: reason,
        $push: {
          statusHistory: {
            status: "refunded",
            timestamp: new Date(),
            note: `Refund processed: ${reason}`,
            updatedBy: userId,
          },
        },
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            orderId,
            refundId: refundResult.refundId,
            amount: refundResult.amount,
            status: "refunded",
          },
          "Refund processed successfully"
        )
      );
    } else {
      throw new ApiError(500, "Refund processing failed");
    }
  });

  /**
   * Get payment details for an order
   * @route GET /api/v1/payments/:orderId
   * @access Private (Buyer/Seller/Admin)
   */
  static getPaymentDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate order exists
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check permissions
    if (userRole === "buyer") {
      if (order.buyerId.toString() !== userId.toString()) {
        throw new ApiError(
          403,
          "You can only view payments for your own orders"
        );
      }
    } else if (userRole === "seller") {
      const hasSellerProducts = order.items.some(
        (item) => item.sellerId.toString() === userId.toString()
      );
      if (!hasSellerProducts) {
        throw new ApiError(
          403,
          "You can only view payments for orders containing your products"
        );
      }
    }

    // Get payment details from Razorpay if transaction exists
    let razorpayDetails = null;
    if (order.payment.transactionId) {
      try {
        razorpayDetails = await PaymentService.getPaymentDetails(
          order.payment.transactionId
        );
      } catch (error) {
        // Payment might not exist or be accessible
        console.log("Payment not accessible:", error.message);
      }
    }

    const paymentDetails = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      payment: {
        method: order.payment.method,
        status: order.payment.status,
        amount: order.totals.total,
        currency: "INR",
        gateway: order.payment.gateway,
        transactionId: order.payment.transactionId,
        paidAt: order.payment.paidAt,
      },
      razorpayDetails,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          paymentDetails,
          "Payment details retrieved successfully"
        )
      );
  });
}

module.exports = PaymentController;

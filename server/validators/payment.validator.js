const Joi = require("joi");

/**
 * Payment Validation Schemas
 */

// Validation for creating Razorpay order
const createRazorpayOrderSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Order ID must be a valid MongoDB ObjectId",
    "string.length": "Order ID must be 24 characters long",
    "any.required": "Order ID is required",
  }),
});

// Validation for verifying Razorpay payment
const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Order ID must be a valid MongoDB ObjectId",
    "string.length": "Order ID must be 24 characters long",
    "any.required": "Order ID is required",
  }),
  razorpayOrderId: Joi.string().required().messages({
    "string.base": "Razorpay order ID must be a string",
    "any.required": "Razorpay order ID is required",
  }),
  razorpayPaymentId: Joi.string().required().messages({
    "string.base": "Razorpay payment ID must be a string",
    "any.required": "Razorpay payment ID is required",
  }),
  razorpaySignature: Joi.string().required().messages({
    "string.base": "Razorpay signature must be a string",
    "any.required": "Razorpay signature is required",
  }),
});

// Validation for processing refund
const processRefundSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Order ID must be a valid MongoDB ObjectId",
    "string.length": "Order ID must be 24 characters long",
    "any.required": "Order ID is required",
  }),
  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  reason: Joi.string().max(500).optional().messages({
    "string.base": "Reason must be a string",
    "string.max": "Reason cannot exceed 500 characters",
  }),
});

module.exports = {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  processRefundSchema,
};

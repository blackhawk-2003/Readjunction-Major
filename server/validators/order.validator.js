const Joi = require("joi");

// Validation for creating a new order
const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required().messages({
          "string.hex": "Product ID must be a valid MongoDB ObjectId",
          "string.length": "Product ID must be 24 characters long",
          "any.required": "Product ID is required",
        }),
        quantity: Joi.number().integer().min(1).max(100).required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "number.max": "Quantity cannot exceed 100",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Order must contain at least one item",
      "any.required": "Items are required",
    }),
  payment: Joi.object({
    method: Joi.string()
      .valid("cod", "online", "card", "upi", "wallet", "razorpay")
      .required()
      .messages({
        "string.base": "Payment method must be a string",
        "any.only":
          "Payment method must be one of: cod, online, card, upi, wallet, razorpay",
        "any.required": "Payment method is required",
      }),
  }).required(),
  shipping: Joi.object({
    address: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Shipping name is required",
      }),
      phone: Joi.string()
        .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
        .required()
        .messages({
          "string.pattern.base": "Phone number must be valid",
          "any.required": "Phone number is required",
        }),
      street: Joi.string().min(5).max(200).required().messages({
        "string.min": "Street address must be at least 5 characters long",
        "string.max": "Street address cannot exceed 200 characters",
        "any.required": "Street address is required",
      }),
      city: Joi.string().min(2).max(50).required().messages({
        "string.min": "City must be at least 2 characters long",
        "string.max": "City cannot exceed 50 characters",
        "any.required": "City is required",
      }),
      state: Joi.string().min(2).max(50).required().messages({
        "string.min": "State must be at least 2 characters long",
        "string.max": "State cannot exceed 50 characters",
        "any.required": "State is required",
      }),
      zipCode: Joi.string()
        .pattern(/^[\d\-]{5,10}$/)
        .required()
        .messages({
          "string.pattern.base": "Zip code must be valid",
          "any.required": "Zip code is required",
        }),
      country: Joi.string().min(2).max(50).required().messages({
        "string.min": "Country must be at least 2 characters long",
        "string.max": "Country cannot exceed 50 characters",
        "any.required": "Country is required",
      }),
    }).required(),
    method: Joi.string()
      .valid("standard", "express", "overnight")
      .default("standard")
      .messages({
        "string.base": "Shipping method must be a string",
        "any.only":
          "Shipping method must be one of: standard, express, overnight",
      }),
  }).required(),
  notes: Joi.object({
    buyer: Joi.string().max(500).optional().messages({
      "string.max": "Buyer notes cannot exceed 500 characters",
    }),
  }).optional(),
});

// Validation for updating order status
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
      "returned"
    )
    .required()
    .messages({
      "string.base": "Status must be a string",
      "any.only":
        "Status must be one of: pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, refunded, returned",
      "any.required": "Status is required",
    }),
  note: Joi.string().max(200).optional().messages({
    "string.max": "Status note cannot exceed 200 characters",
  }),
  trackingNumber: Joi.string().max(50).optional().messages({
    "string.max": "Tracking number cannot exceed 50 characters",
  }),
  estimatedDelivery: Joi.date().min("now").optional().messages({
    "date.min": "Estimated delivery date must be in the future",
  }),
});

// Validation for cancelling an order
const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Cancellation reason must be at least 10 characters long",
    "string.max": "Cancellation reason cannot exceed 500 characters",
    "any.required": "Cancellation reason is required",
  }),
});

// Validation for refunding an order
const refundOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Refund reason must be at least 10 characters long",
    "string.max": "Refund reason cannot exceed 500 characters",
    "any.required": "Refund reason is required",
  }),
  amount: Joi.number().positive().optional().messages({
    "number.base": "Refund amount must be a number",
    "number.positive": "Refund amount must be positive",
  }),
});

// Validation for returning an order
const returnOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Return reason must be at least 10 characters long",
    "string.max": "Return reason cannot exceed 500 characters",
    "any.required": "Return reason is required",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required().messages({
          "string.hex": "Product ID must be a valid MongoDB ObjectId",
          "string.length": "Product ID must be 24 characters long",
          "any.required": "Product ID is required",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
        reason: Joi.string().min(5).max(200).optional().messages({
          "string.min": "Item return reason must be at least 5 characters long",
          "string.max": "Item return reason cannot exceed 200 characters",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Return must include at least one item",
      "any.required": "Return items are required",
    }),
});

// Validation for updating payment status
const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .required()
    .messages({
      "string.base": "Payment status must be a string",
      "any.only":
        "Payment status must be one of: pending, completed, failed, refunded",
      "any.required": "Payment status is required",
    }),
  transactionId: Joi.string().max(100).optional().messages({
    "string.max": "Transaction ID cannot exceed 100 characters",
  }),
  gateway: Joi.string().max(50).optional().messages({
    "string.max": "Payment gateway cannot exceed 50 characters",
  }),
});

// Validation for admin order queries
const adminOrderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
      "returned"
    )
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only":
        "Status must be one of: pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, refunded, returned",
    }),
  paymentStatus: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .optional()
    .messages({
      "string.base": "Payment status must be a string",
      "any.only":
        "Payment status must be one of: pending, completed, failed, refunded",
    }),
  sellerId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Seller ID must be a valid MongoDB ObjectId",
    "string.length": "Seller ID must be 24 characters long",
  }),
  buyerId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Buyer ID must be a valid MongoDB ObjectId",
    "string.length": "Buyer ID must be 24 characters long",
  }),
  startDate: Joi.date().optional().messages({
    "date.base": "Start date must be a valid date",
  }),
  endDate: Joi.date().min(Joi.ref("startDate")).optional().messages({
    "date.base": "End date must be a valid date",
    "date.min": "End date must be after start date",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

// Validation for buyer order queries
const buyerOrderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
      "returned"
    )
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only":
        "Status must be one of: pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, refunded, returned",
    }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 50",
  }),
});

// Validation for seller order queries
const sellerOrderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
      "returned"
    )
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only":
        "Status must be one of: pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, refunded, returned",
    }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 50",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  refundOrderSchema,
  returnOrderSchema,
  updatePaymentStatusSchema,
  adminOrderQuerySchema,
  buyerOrderQuerySchema,
  sellerOrderQuerySchema,
};

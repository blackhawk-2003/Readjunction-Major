const Joi = require("joi");

// Validation for adding item to cart
const addToCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Product ID must be a valid MongoDB ObjectId",
    "string.length": "Product ID must be 24 characters long",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 100",
  }),
  notes: Joi.string().max(200).optional().messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),
});

// Validation for updating cart item quantity
const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 100",
    "any.required": "Quantity is required",
  }),
  notes: Joi.string().max(200).optional().messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),
});

// Validation for updating cart item selection
const updateItemSelectionSchema = Joi.object({
  isSelected: Joi.boolean().required().messages({
    "boolean.base": "isSelected must be a boolean",
    "any.required": "isSelected is required",
  }),
});

// Validation for updating shipping address
const updateShippingAddressSchema = Joi.object({
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
});

// Validation for updating shipping method
const updateShippingMethodSchema = Joi.object({
  shippingMethod: Joi.string()
    .valid("standard", "express", "overnight")
    .required()
    .messages({
      "string.base": "Shipping method must be a string",
      "any.only":
        "Shipping method must be one of: standard, express, overnight",
      "any.required": "Shipping method is required",
    }),
});

// Validation for updating payment method
const updatePaymentMethodSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("cod", "online", "card", "upi", "wallet")
    .required()
    .messages({
      "string.base": "Payment method must be a string",
      "any.only":
        "Payment method must be one of: cod, online, card, upi, wallet",
      "any.required": "Payment method is required",
    }),
});

// Validation for applying coupon
const applyCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).required().messages({
    "string.min": "Coupon code must be at least 3 characters long",
    "string.max": "Coupon code cannot exceed 20 characters",
    "any.required": "Coupon code is required",
  }),
});

// Validation for removing coupon
const removeCouponSchema = Joi.object({
  // No fields required, just confirmation
});

// Validation for bulk operations
const bulkUpdateCartSchema = Joi.object({
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
        isSelected: Joi.boolean().optional().messages({
          "boolean.base": "isSelected must be a boolean",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one item must be provided",
      "any.required": "Items are required",
    }),
});

// Validation for moving items from wishlist to cart
const moveToCartSchema = Joi.object({
  productIds: Joi.array()
    .items(
      Joi.string().hex().length(24).messages({
        "string.hex": "Product ID must be a valid MongoDB ObjectId",
        "string.length": "Product ID must be 24 characters long",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one product ID must be provided",
      "any.required": "Product IDs are required",
    }),
  quantities: Joi.object()
    .pattern(
      Joi.string().hex().length(24),
      Joi.number().integer().min(1).max(100)
    )
    .optional()
    .messages({
      "object.pattern":
        "Quantities must be valid product ID to quantity mappings",
    }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  updateItemSelectionSchema,
  updateShippingAddressSchema,
  updateShippingMethodSchema,
  updatePaymentMethodSchema,
  applyCouponSchema,
  removeCouponSchema,
  bulkUpdateCartSchema,
  moveToCartSchema,
};

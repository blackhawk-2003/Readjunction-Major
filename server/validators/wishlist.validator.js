const Joi = require("joi");

// Validation for creating a new wishlist
const createWishlistSchema = Joi.object({
  name: Joi.string().min(1).max(100).default("My Wishlist").messages({
    "string.min": "Wishlist name must be at least 1 character long",
    "string.max": "Wishlist name cannot exceed 100 characters",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isPublic: Joi.boolean().default(false).messages({
    "boolean.base": "isPublic must be a boolean",
  }),
});

// Validation for adding item to wishlist
const addToWishlistSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Product ID must be a valid MongoDB ObjectId",
    "string.length": "Product ID must be 24 characters long",
    "any.required": "Product ID is required",
  }),
  notes: Joi.string().max(200).optional().messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .default("medium")
    .messages({
      "string.base": "Priority must be a string",
      "any.only": "Priority must be one of: low, medium, high",
    }),
});

// Validation for updating wishlist item
const updateWishlistItemSchema = Joi.object({
  notes: Joi.string().max(200).optional().messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),
  priority: Joi.string().valid("low", "medium", "high").optional().messages({
    "string.base": "Priority must be a string",
    "any.only": "Priority must be one of: low, medium, high",
  }),
});

// Validation for updating wishlist settings
const updateWishlistSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Wishlist name must be at least 1 character long",
    "string.max": "Wishlist name cannot exceed 100 characters",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isPublic: Joi.boolean().optional().messages({
    "boolean.base": "isPublic must be a boolean",
  }),
});

// Validation for moving items from wishlist to cart
const moveWishlistToCartSchema = Joi.object({
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

// Validation for wishlist query parameters
const wishlistQuerySchema = Joi.object({
  priority: Joi.string().valid("low", "medium", "high").optional().messages({
    "string.base": "Priority must be a string",
    "any.only": "Priority must be one of: low, medium, high",
  }),
  hasPriceDrop: Joi.boolean().optional().messages({
    "boolean.base": "hasPriceDrop must be a boolean",
  }),
  sortBy: Joi.string()
    .valid("addedAt", "priority", "price", "name")
    .default("addedAt")
    .messages({
      "string.base": "Sort by must be a string",
      "any.only": "Sort by must be one of: addedAt, priority, price, name",
    }),
  sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
    "string.base": "Sort order must be a string",
    "any.only": "Sort order must be one of: asc, desc",
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

// Validation for sharing wishlist
const shareWishlistSchema = Joi.object({
  isPublic: Joi.boolean().required().messages({
    "boolean.base": "isPublic must be a boolean",
    "any.required": "isPublic is required",
  }),
  shareWith: Joi.array().items(Joi.string().email()).optional().messages({
    "array.base": "shareWith must be an array",
    "string.email": "Each email must be valid",
  }),
});

// Validation for copying wishlist
const copyWishlistSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.min": "Wishlist name must be at least 1 character long",
    "string.max": "Wishlist name cannot exceed 100 characters",
    "any.required": "Wishlist name is required",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  includeItems: Joi.boolean().default(true).messages({
    "boolean.base": "includeItems must be a boolean",
  }),
});

// Validation for bulk operations on wishlist
const bulkWishlistOperationSchema = Joi.object({
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
  operation: Joi.string()
    .valid("remove", "moveToCart", "updatePriority", "updateNotes")
    .required()
    .messages({
      "string.base": "Operation must be a string",
      "any.only":
        "Operation must be one of: remove, moveToCart, updatePriority, updateNotes",
      "any.required": "Operation is required",
    }),
  priority: Joi.string().valid("low", "medium", "high").optional().messages({
    "string.base": "Priority must be a string",
    "any.only": "Priority must be one of: low, medium, high",
  }),
  notes: Joi.string().max(200).optional().messages({
    "string.max": "Notes cannot exceed 200 characters",
  }),
});

module.exports = {
  createWishlistSchema,
  addToWishlistSchema,
  updateWishlistItemSchema,
  updateWishlistSchema,
  moveWishlistToCartSchema,
  wishlistQuerySchema,
  shareWishlistSchema,
  copyWishlistSchema,
  bulkWishlistOperationSchema,
};

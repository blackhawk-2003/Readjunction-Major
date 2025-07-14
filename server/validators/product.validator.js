const Joi = require("joi");

// Image schema
const imageSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.uri": "Image URL must be a valid URL",
    "any.required": "Image URL is required",
  }),
  alt: Joi.string().max(100).optional(),
  isPrimary: Joi.boolean().default(false),
});

// Inventory schema
const inventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0).default(0),
  lowStockThreshold: Joi.number().integer().min(0).default(5),
  trackInventory: Joi.boolean().default(true),
  allowBackorder: Joi.boolean().default(false),
  maxOrderQuantity: Joi.number().integer().min(1).max(100).default(10),
});

// Variant schema
const variantSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  options: Joi.array().items(Joi.string().trim().max(50)).min(1).required(),
  priceModifier: Joi.number().precision(2).default(0),
});

// Specification schema
const specificationSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  value: Joi.string().trim().max(500).required(),
});

// SEO schema
const seoSchema = Joi.object({
  metaTitle: Joi.string().trim().max(60).optional(),
  metaDescription: Joi.string().trim().max(160).optional(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
});

// Shipping schema
const shippingSchema = Joi.object({
  weight: Joi.number().min(0).optional(), // in grams
  dimensions: Joi.object({
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
  }).optional(),
  freeShipping: Joi.boolean().default(false),
  shippingClass: Joi.string().trim().max(50).optional(),
});

// Create product schema
const createProductSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().min(10).max(2000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
    "any.required": "Description is required",
  }),

  shortDescription: Joi.string().trim().max(500).optional().messages({
    "string.max": "Short description cannot exceed 500 characters",
  }),

  category: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 100 characters",
    "any.required": "Category is required",
  }),

  subcategory: Joi.string().trim().max(100).optional().messages({
    "string.max": "Subcategory cannot exceed 100 characters",
  }),

  brand: Joi.string().trim().max(100).optional().messages({
    "string.max": "Brand cannot exceed 100 characters",
  }),

  sku: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-_]+$/)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base":
        "SKU can only contain letters, numbers, hyphens, and underscores",
      "string.max": "SKU cannot exceed 50 characters",
    }),

  price: Joi.number().precision(2).min(0).required().messages({
    "number.min": "Price must be greater than or equal to 0",
    "any.required": "Price is required",
  }),

  comparePrice: Joi.number()
    .precision(2)
    .min(0)
    .greater(Joi.ref("price"))
    .optional()
    .messages({
      "number.min": "Compare price must be greater than or equal to 0",
      "number.greater": "Compare price must be greater than the actual price",
    }),

  costPrice: Joi.number().precision(2).min(0).optional().messages({
    "number.min": "Cost price must be greater than or equal to 0",
  }),

  images: Joi.array().items(imageSchema).min(1).max(10).optional().messages({
    "array.min": "At least one image is required",
    "array.max": "Cannot upload more than 10 images",
  }),

  inventory: inventorySchema.optional(),

  variants: Joi.array().items(variantSchema).max(10).optional().messages({
    "array.max": "Cannot have more than 10 variants",
  }),

  specifications: Joi.array()
    .items(specificationSchema)
    .max(50)
    .optional()
    .messages({
      "array.max": "Cannot have more than 50 specifications",
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(20)
    .optional()
    .messages({
      "array.max": "Cannot have more than 20 tags",
    }),

  seo: seoSchema.optional(),

  shipping: shippingSchema.optional(),
});

// Update product schema (all fields optional)
const updateProductSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 200 characters",
  }),

  description: Joi.string().trim().min(10).max(2000).optional().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
  }),

  shortDescription: Joi.string().trim().max(500).optional().messages({
    "string.max": "Short description cannot exceed 500 characters",
  }),

  category: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 100 characters",
  }),

  subcategory: Joi.string().trim().max(100).optional().messages({
    "string.max": "Subcategory cannot exceed 100 characters",
  }),

  brand: Joi.string().trim().max(100).optional().messages({
    "string.max": "Brand cannot exceed 100 characters",
  }),

  sku: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-_]+$/)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base":
        "SKU can only contain letters, numbers, hyphens, and underscores",
      "string.max": "SKU cannot exceed 50 characters",
    }),

  price: Joi.number().precision(2).min(0).optional().messages({
    "number.min": "Price must be greater than or equal to 0",
  }),

  comparePrice: Joi.number().precision(2).min(0).optional().messages({
    "number.min": "Compare price must be greater than or equal to 0",
  }),

  costPrice: Joi.number().precision(2).min(0).optional().messages({
    "number.min": "Cost price must be greater than or equal to 0",
  }),

  images: Joi.array().items(imageSchema).max(10).optional().messages({
    "array.max": "Cannot upload more than 10 images",
  }),

  inventory: inventorySchema.optional(),

  variants: Joi.array().items(variantSchema).max(10).optional().messages({
    "array.max": "Cannot have more than 10 variants",
  }),

  specifications: Joi.array()
    .items(specificationSchema)
    .max(50)
    .optional()
    .messages({
      "array.max": "Cannot have more than 50 specifications",
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(20)
    .optional()
    .messages({
      "array.max": "Cannot have more than 20 tags",
    }),

  seo: seoSchema.optional(),

  shipping: shippingSchema.optional(),

  status: Joi.string().valid("active", "inactive", "draft").optional(),

  featured: Joi.boolean().optional(),

  featuredUntil: Joi.date().greater("now").optional().messages({
    "date.greater": "Featured until date must be in the future",
  }),
});

// Update inventory schema
const updateInventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    "number.integer": "Quantity must be a whole number",
    "number.min": "Quantity must be greater than or equal to 0",
    "any.required": "Quantity is required",
  }),

  operation: Joi.string()
    .valid("set", "increase", "decrease")
    .default("set")
    .messages({
      "any.only": "Operation must be one of: set, increase, decrease",
    }),
});

// Query parameters schema for product listing
const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().trim().optional(),
  subcategory: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  status: Joi.string().valid("active", "inactive", "draft").optional(),
  sortBy: Joi.string()
    .valid("createdAt", "price", "title", "sales.totalSold", "ratings.average")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().max(100).optional(),
  featured: Joi.boolean().optional(),
  inStock: Joi.boolean().optional(),
});

// ==================== ADMIN VALIDATION SCHEMAS ====================

// Approve product schema
const approveProductSchema = Joi.object({
  notes: Joi.string().trim().max(500).optional().messages({
    "string.max": "Approval notes cannot exceed 500 characters",
  }),
});

// Reject product schema
const rejectProductSchema = Joi.object({
  notes: Joi.string().trim().max(500).required().messages({
    "string.max": "Rejection notes cannot exceed 500 characters",
    "any.required": "Rejection notes are required",
  }),
  reason: Joi.string().trim().max(200).required().messages({
    "string.max": "Rejection reason cannot exceed 200 characters",
    "any.required": "Rejection reason is required",
  }),
});

// Update approval status schema
const updateApprovalStatusSchema = Joi.object({
  approvalStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .required()
    .messages({
      "any.only": "Approval status must be one of: pending, approved, rejected",
      "any.required": "Approval status is required",
    }),
  notes: Joi.string().trim().max(500).optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
  reason: Joi.string().trim().max(200).optional().messages({
    "string.max": "Reason cannot exceed 200 characters",
  }),
}).custom((value, helpers) => {
  // Custom validation: reason is required when status is rejected
  if (value.approvalStatus === "rejected" && !value.reason) {
    return helpers.error("any.invalid", {
      message: "Reason is required when rejecting a product",
    });
  }
  return value;
});

// Bulk approve products schema
const bulkApproveProductsSchema = Joi.object({
  productIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one product ID is required",
      "array.max": "Cannot approve more than 100 products at once",
      "any.required": "Product IDs array is required",
    }),
  notes: Joi.string().trim().max(500).optional().messages({
    "string.max": "Approval notes cannot exceed 500 characters",
  }),
});

// Bulk reject products schema
const bulkRejectProductsSchema = Joi.object({
  productIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one product ID is required",
      "array.max": "Cannot reject more than 100 products at once",
      "any.required": "Product IDs array is required",
    }),
  notes: Joi.string().trim().max(500).required().messages({
    "string.max": "Rejection notes cannot exceed 500 characters",
    "any.required": "Rejection notes are required",
  }),
  reason: Joi.string().trim().max(200).required().messages({
    "string.max": "Rejection reason cannot exceed 200 characters",
    "any.required": "Rejection reason is required",
  }),
});

// Admin query parameters schema
const adminProductQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  approvalStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .optional(),
  status: Joi.string().valid("active", "inactive", "draft").optional(),
  sellerId: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "title", "price", "approvalStatus")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Set featured schema (admin)
const setFeatured = Joi.object({
  featured: Joi.boolean().required(),
});

module.exports = {
  productSchemas: {
    createProduct: createProductSchema,
    updateProduct: updateProductSchema,
    updateInventory: updateInventorySchema,
    productQuery: productQuerySchema,
    // Admin schemas
    approveProduct: approveProductSchema,
    rejectProduct: rejectProductSchema,
    updateApprovalStatus: updateApprovalStatusSchema,
    bulkApproveProducts: bulkApproveProductsSchema,
    bulkRejectProducts: bulkRejectProductsSchema,
    adminProductQuery: adminProductQuerySchema,
  },
  setFeatured,
};

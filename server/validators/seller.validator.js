const Joi = require("joi");

const sellerAnalyticsSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  period: Joi.string().valid("daily", "weekly", "monthly", "yearly").optional(),
});

const sellerProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid("active", "inactive", "draft", "pending_approval")
    .optional(),
  category: Joi.string().optional(),
});

const sellerOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
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
    .optional(),
});

module.exports = {
  sellerAnalyticsSchema,
  sellerProductsSchema,
  sellerOrdersSchema,
};

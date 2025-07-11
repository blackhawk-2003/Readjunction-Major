const Joi = require("joi");

const updateProfile = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

// Address validation schema
const addressSchema = Joi.object({
  type: Joi.string()
    .valid("home", "work", "billing", "shipping", "other")
    .default("shipping"),
  isDefault: Joi.boolean().default(false),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  company: Joi.string().max(100).optional().allow(""),
  street: Joi.string().min(5).max(200).required(),
  apartment: Joi.string().max(50).optional().allow(""),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  zipCode: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).default("United States"),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow(""),
  instructions: Joi.string().max(500).optional().allow(""),
});

const addAddress = addressSchema;

const updateAddress = addressSchema.keys({
  type: Joi.string()
    .valid("home", "work", "billing", "shipping", "other")
    .optional(),
  isDefault: Joi.boolean().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  street: Joi.string().min(5).max(200).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  zipCode: Joi.string().min(3).max(20).optional(),
  country: Joi.string().min(2).max(100).optional(),
});

module.exports = {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
};

const Joi = require("joi");

const registerUser = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid("buyer", "seller", "admin").default("buyer"),
  businessInfo: Joi.when("role", {
    is: "seller",
    then: Joi.object({
      businessName: Joi.string().min(2).max(100).required(),
      businessDescription: Joi.string().max(500).optional(),
      businessType: Joi.string()
        .valid("retail", "wholesale", "manufacturer", "service")
        .optional(),
      taxId: Joi.string().required(),
      businessAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required(),
      }).required(),
      bankDetails: Joi.object({
        accountNumber: Joi.string().required(),
        routingNumber: Joi.string().required(),
        accountHolderName: Joi.string().required(),
        bankName: Joi.string().required(),
      }).required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

const resetPassword = Joi.object({
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
  }),
});

module.exports = { registerUser, login, forgotPassword, resetPassword };

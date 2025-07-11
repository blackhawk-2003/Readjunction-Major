/**
 * User Routes
 *
 * - GET    /api/v1/users/profile      - Get current user's profile
 * - PUT    /api/v1/users/profile      - Update profile
 * - PUT    /api/v1/users/password     - Change password
 * - DELETE /api/v1/users/account      - Delete/deactivate account
 * - GET    /api/v1/users/addresses    - Get all user addresses
 * - POST   /api/v1/users/addresses    - Add new address
 * - PUT    /api/v1/users/addresses/:id - Update address
 * - DELETE /api/v1/users/addresses/:id - Delete address
 * - PUT    /api/v1/users/addresses/:id/default - Set address as default
 */

const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  updateProfile: updateProfileSchema,
  changePassword: changePasswordSchema,
  addAddress: addAddressSchema,
  updateAddress: updateAddressSchema,
} = require("../validators/user.validator");

// All routes require authentication
router.use(protect);

// Get current user's profile
router.get("/profile", getProfile);

// Update profile
router.put("/profile", validate(updateProfileSchema), updateProfile);

// Change password
router.put("/password", validate(changePasswordSchema), changePassword);

// Delete/deactivate account
router.delete("/account", deleteAccount);

// Address management routes
router.get("/addresses", getAddresses);
router.post("/addresses", validate(addAddressSchema), addAddress);
router.put("/addresses/:id", validate(updateAddressSchema), updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.put("/addresses/:id/default", setDefaultAddress);

module.exports = router;

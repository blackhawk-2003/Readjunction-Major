/**
 * User Controller
 *
 * Routes handled:
 *   GET    /api/v1/users/profile      - Get current user's profile
 *   PUT    /api/v1/users/profile      - Update profile (name, etc.)
 *   PUT    /api/v1/users/password     - Change password
 *   DELETE /api/v1/users/account      - Delete/deactivate account
 *   GET    /api/v1/users/addresses    - Get all user addresses
 *   POST   /api/v1/users/addresses    - Add new address
 *   PUT    /api/v1/users/addresses/:id - Update address
 *   DELETE /api/v1/users/addresses/:id - Delete address
 *   PUT    /api/v1/users/addresses/:id/default - Set address as default
 *
 * Major functionalities:
 *   - Get and update user profile
 *   - Change user password
 *   - Deactivate/delete user account
 *   - Manage multiple addresses (add, update, delete, set default)
 */

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// @desc    Get current user's profile
// @route   GET /api/v1/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, data: { user } });
});

// @desc    Update current user's profile
// @route   PUT /api/v1/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  const user = await User.findById(req.user._id);
  if (firstName) user.profile.firstName = firstName;
  if (lastName) user.profile.lastName = lastName;
  await user.save();
  res.json({ success: true, message: "Profile updated", data: { user } });
});

// @desc    Change user password
// @route   PUT /api/v1/users/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
});

// @desc    Delete/deactivate user account
// @route   DELETE /api/v1/users/account
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: "Account deactivated" });
});

// @desc    Get all user addresses
// @route   GET /api/v1/users/addresses
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");
  res.json({
    success: true,
    data: {
      addresses: user.addresses || [],
      count: user.addresses ? user.addresses.length : 0,
    },
  });
});

// @desc    Add new address
// @route   POST /api/v1/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // If this is the first address or user wants it as default, set isDefault to true
  if (!user.addresses || user.addresses.length === 0) {
    req.body.isDefault = true;
  }

  // If setting as default, unset other defaults of the same type
  if (req.body.isDefault && req.body.type) {
    user.addresses.forEach((addr) => {
      if (addr.type === req.body.type) {
        addr.isDefault = false;
      }
    });
  }

  user.addresses.push(req.body);
  await user.save();

  const newAddress = user.addresses[user.addresses.length - 1];
  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: { address: newAddress },
  });
});

// @desc    Update address
// @route   PUT /api/v1/users/addresses/:id
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(
    (addr) => addr._id.toString() === req.params.id
  );

  if (addressIndex === -1) {
    res.status(404);
    throw new Error("Address not found");
  }

  // If setting as default, unset other defaults of the same type
  if (req.body.isDefault && req.body.type) {
    user.addresses.forEach((addr, index) => {
      if (index !== addressIndex && addr.type === req.body.type) {
        addr.isDefault = false;
      }
    });
  }

  // Update address fields
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      user.addresses[addressIndex][key] = req.body[key];
    }
  });

  await user.save();
  res.json({
    success: true,
    message: "Address updated successfully",
    data: { address: user.addresses[addressIndex] },
  });
});

// @desc    Delete address
// @route   DELETE /api/v1/users/addresses/:id
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(
    (addr) => addr._id.toString() === req.params.id
  );

  if (addressIndex === -1) {
    res.status(404);
    throw new Error("Address not found");
  }

  const deletedAddress = user.addresses[addressIndex];
  user.addresses.splice(addressIndex, 1);
  await user.save();

  res.json({
    success: true,
    message: "Address deleted successfully",
    data: { address: deletedAddress },
  });
});

// @desc    Set address as default
// @route   PUT /api/v1/users/addresses/:id/default
const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(
    (addr) => addr._id.toString() === req.params.id
  );

  if (addressIndex === -1) {
    res.status(404);
    throw new Error("Address not found");
  }

  const targetAddress = user.addresses[addressIndex];

  // Unset other defaults of the same type
  user.addresses.forEach((addr, index) => {
    if (index !== addressIndex && addr.type === targetAddress.type) {
      addr.isDefault = false;
    }
  });

  // Set this address as default
  targetAddress.isDefault = true;
  await user.save();

  res.json({
    success: true,
    message: "Default address set successfully",
    data: { address: targetAddress },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

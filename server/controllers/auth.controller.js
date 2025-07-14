/**
 * Auth Controller
 *
 * Routes handled:
 *   POST   /api/v1/auth/register         - Register a new user or seller
 *   POST   /api/v1/auth/login            - Login user or seller
 *   POST   /api/v1/auth/logout           - Logout user
 *   POST   /api/v1/auth/refresh-token    - Refresh JWT token
 *   GET    /api/v1/auth/me               - Get current user (and seller if applicable)
 *   POST   /api/v1/auth/forgot-password  - Request password reset
 *   POST   /api/v1/auth/reset-password/:resetToken - Reset password
 *
 * Major functionalities:
 *   - User and seller registration (with business info for sellers)
 *   - JWT authentication and refresh
 *   - Password reset flow
 *   - Role-based user info retrieval
 */

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Seller = require("../models/seller.model");
const crypto = require("crypto");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

// @desc    Register a new user or seller
// @route   POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role = "buyer",
    // Handle both nested businessInfo and flat fields
    businessInfo,
    businessName,
    businessDescription,
    businessAddress,
    taxId,
    bankDetails,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // If registering as seller, require business info
  let user, seller;
  if (role === "seller") {
    // Extract business info from nested object or use flat fields
    const businessData = businessInfo || {
      businessName,
      businessDescription,
      businessAddress,
      taxId,
      bankDetails,
    };

    if (
      !businessData.businessName ||
      !businessData.businessAddress ||
      !businessData.taxId ||
      !businessData.bankDetails
    ) {
      res.status(400);
      throw new Error("Missing business information for seller registration");
    }

    user = await User.create({
      email,
      password,
      role,
      profile: { firstName, lastName },
    });

    seller = await Seller.create({
      userId: user._id,
      businessName: businessData.businessName,
      businessDescription: businessData.businessDescription,
      businessAddress: businessData.businessAddress,
      taxId: businessData.taxId,
      bankDetails: businessData.bankDetails,
    });
  } else {
    user = await User.create({
      email,
      password,
      role,
      profile: { firstName, lastName },
    });
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      seller: seller
        ? {
            _id: seller._id,
            businessName: seller.businessName,
            isApproved: seller.isApproved,
          }
        : undefined,
      accessToken: token,
    },
  });
});

// @desc    Login user or seller
// @route   POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated. Please contact support.");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) user.lockUntil = Date.now() + 30 * 60 * 1000;
    await user.save();
    res.status(401);
    throw new Error("Invalid credentials");
  }
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  let seller = undefined;
  if (user.role === "seller") {
    seller = await Seller.findOne({ userId: user._id });
  }
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      seller,
      token,
    },
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc    Refresh JWT token
// @route   POST /api/v1/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401);
    throw new Error("No refresh token provided");
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }
});

// @desc    Get current user (and seller info if applicable)
// @route   GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let seller = undefined;
  if (user.role === "seller") {
    seller = await Seller.findOne({ userId: user._id });
  }
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      seller,
    },
  });
});

// @desc    Request password reset (send reset token)
// @route   POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const resetToken = user.getResetPasswordToken();
  await user.save();
  res.json({
    success: true,
    message: "Password reset email sent",
    data: {
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    },
  });
});

// @desc    Reset password using reset token
// @route   POST /api/v1/auth/reset-password/:resetToken
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  const token = generateToken(user._id);
  res.json({
    success: true,
    message: "Password reset successful",
    data: { token },
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
};

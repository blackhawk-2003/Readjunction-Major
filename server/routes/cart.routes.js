const express = require("express");
const router = express.Router();

// Import controllers
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  updateItemSelection,
  updateShippingAddress,
  updateShippingMethod,
  updatePaymentMethod,
  applyCoupon,
  removeCoupon,
  bulkUpdateCart,
  clearCart,
  getCartSummary,
  moveFromWishlistToCart,
  getCartForCheckout,
} = require("../controllers/cart.controller");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Import validators
const {
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
} = require("../validators/cart.validator");

// All routes require buyer authentication
router.use(protect);
router.use(authorize("buyer"));

// Cart Management Routes
router
  .route("/")
  .get(getCart) // Get user's cart
  .post(validate(addToCartSchema), addToCart) // Add item to cart
  .delete(clearCart); // Clear entire cart

// Cart Summary
router.get("/summary", getCartSummary);

// Cart Item Management
router
  .route("/items/:productId")
  .put(validate(updateCartItemSchema), updateCartItem) // Update item quantity/notes
  .delete(removeFromCart); // Remove item from cart

// Item Selection
router.put(
  "/items/:productId/selection",
  validate(updateItemSelectionSchema),
  updateItemSelection
);

// Shipping Management
router.put(
  "/shipping/address",
  validate(updateShippingAddressSchema),
  updateShippingAddress
);
router.put(
  "/shipping/method",
  validate(updateShippingMethodSchema),
  updateShippingMethod
);

// Payment Method
router.put(
  "/payment/method",
  validate(updatePaymentMethodSchema),
  updatePaymentMethod
);

// Coupon Management
router
  .route("/coupon")
  .post(validate(applyCouponSchema), applyCoupon) // Apply coupon
  .delete(removeCoupon); // Remove coupon

// Bulk Operations
router.put("/bulk", validate(bulkUpdateCartSchema), bulkUpdateCart);

// Wishlist Integration
router.post(
  "/from-wishlist",
  validate(moveToCartSchema),
  moveFromWishlistToCart
);

// Checkout Preparation
router.get("/checkout", getCartForCheckout);

module.exports = router;

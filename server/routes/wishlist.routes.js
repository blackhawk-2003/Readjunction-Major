const express = require("express");
const router = express.Router();

// Import controllers
const {
  getWishlists,
  getWishlist,
  createWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  updateWishlist,
  deleteWishlist,
  moveToCart,
  getWishlistItems,
  checkPriceDrops,
  shareWishlist,
  copyWishlist,
  bulkWishlistOperation,
  getPublicWishlist,
} = require("../controllers/wishlist.controller");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Import validators
const {
  createWishlistSchema,
  addToWishlistSchema,
  updateWishlistItemSchema,
  updateWishlistSchema,
  moveWishlistToCartSchema,
  wishlistQuerySchema,
  shareWishlistSchema,
  copyWishlistSchema,
  bulkWishlistOperationSchema,
} = require("../validators/wishlist.validator");

// Public route for viewing shared wishlists
router.get("/public/:wishlistId", getPublicWishlist);

// All other routes require buyer authentication
router.use(protect);
router.use(authorize("buyer"));

// Wishlist Management Routes
router
  .route("/")
  .get(validate(wishlistQuerySchema, "query"), getWishlists) // Get user's wishlists
  .post(validate(createWishlistSchema), createWishlist); // Create new wishlist

// Specific Wishlist Routes
router
  .route("/:wishlistId")
  .get(getWishlist) // Get specific wishlist
  .put(validate(updateWishlistSchema), updateWishlist) // Update wishlist settings
  .delete(deleteWishlist); // Delete wishlist

// Wishlist Items Management
router
  .route("/:wishlistId/items")
  .get(validate(wishlistQuerySchema, "query"), getWishlistItems) // Get wishlist items with filtering
  .post(validate(addToWishlistSchema), addToWishlist); // Add item to wishlist

// Specific Item Management
router
  .route("/:wishlistId/items/:productId")
  .put(validate(updateWishlistItemSchema), updateWishlistItem) // Update item notes/priority
  .delete(removeFromWishlist); // Remove item from wishlist

// Wishlist Operations
router.post(
  "/:wishlistId/move-to-cart",
  validate(moveWishlistToCartSchema),
  moveToCart
); // Move items to cart
router.get("/:wishlistId/price-drops", checkPriceDrops); // Check for price drops
router.put("/:wishlistId/share", validate(shareWishlistSchema), shareWishlist); // Share wishlist
router.post("/:wishlistId/copy", validate(copyWishlistSchema), copyWishlist); // Copy wishlist

// Bulk Operations
router.put(
  "/:wishlistId/bulk",
  validate(bulkWishlistOperationSchema),
  bulkWishlistOperation
);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateInventory,
  getCategories,
  getFeaturedProducts,
  getRelatedProducts,
  // Admin functions
  getPendingApprovalProducts,
  approveProduct,
  rejectProduct,
  bulkApproveProducts,
  bulkRejectProducts,
  getAdminDashboard,
  getAllProductsForAdmin,
  updateProductApprovalStatus,
} = require("../controllers/product.controller");

const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { productSchemas } = require("../validators/product.validator");

/**
 * @route   POST /api/products
 * @desc    Create a new product (Seller only)
 * @access  Private
 */
router.post(
  "/",
  protect,
  authorize("seller"),
  validate(productSchemas.createProduct),
  createProduct
);

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get("/", getProducts);

/**
 * @route   GET /api/products/categories
 * @desc    Get product categories, subcategories, and brands
 * @access  Public
 */
router.get("/categories", getCategories);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get("/featured", getFeaturedProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get("/:id", getProductById);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get("/:id/related", getRelatedProducts);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Seller - own products only)
 * @access  Private
 */
router.put(
  "/:id",
  protect,
  authorize("seller"),
  validate(productSchemas.updateProduct),
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Seller - own products only)
 * @access  Private
 */
router.delete("/:id", protect, authorize("seller"), deleteProduct);

/**
 * @route   PATCH /api/products/:id/inventory
 * @desc    Update product inventory (Seller - own products only)
 * @access  Private
 */
router.patch(
  "/:id/inventory",
  protect,
  authorize("seller"),
  validate(productSchemas.updateInventory),
  updateInventory
);

/**
 * @route   GET /api/products/seller/my-products
 * @desc    Get seller's products (Seller only)
 * @access  Private
 */
router.get(
  "/seller/my-products",
  protect,
  authorize("seller"),
  getSellerProducts
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/products/admin/pending-approval
 * @desc    Get products pending approval (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  "/admin/pending-approval",
  protect,
  authorize("admin"),
  getPendingApprovalProducts
);

/**
 * @route   GET /api/products/admin/dashboard
 * @desc    Get admin dashboard stats (Admin only)
 * @access  Private (Admin only)
 */
router.get("/admin/dashboard", protect, authorize("admin"), getAdminDashboard);

/**
 * @route   GET /api/products/admin/all
 * @desc    Get all products for admin (with approval status)
 * @access  Private (Admin only)
 */
router.get("/admin/all", protect, authorize("admin"), getAllProductsForAdmin);

/**
 * @route   PATCH /api/products/admin/:id/approve
 * @desc    Approve a product (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/:id/approve",
  protect,
  authorize("admin"),
  validate(productSchemas.approveProduct),
  approveProduct
);

/**
 * @route   PATCH /api/products/admin/:id/reject
 * @desc    Reject a product (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/:id/reject",
  protect,
  authorize("admin"),
  validate(productSchemas.rejectProduct),
  rejectProduct
);

/**
 * @route   PATCH /api/products/admin/:id/approval-status
 * @desc    Update product approval status (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/:id/approval-status",
  protect,
  authorize("admin"),
  validate(productSchemas.updateApprovalStatus),
  updateProductApprovalStatus
);

/**
 * @route   PATCH /api/products/admin/bulk-approve
 * @desc    Bulk approve products (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/bulk-approve",
  protect,
  authorize("admin"),
  validate(productSchemas.bulkApproveProducts),
  bulkApproveProducts
);

/**
 * @route   PATCH /api/products/admin/bulk-reject
 * @desc    Bulk reject products (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/bulk-reject",
  protect,
  authorize("admin"),
  validate(productSchemas.bulkRejectProducts),
  bulkRejectProducts
);

module.exports = router;

const Product = require("../models/product.model");
const Seller = require("../models/seller.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Seller only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    sku,
    price,
    comparePrice,
    costPrice,
    images,
    inventory,
    variants,
    specifications,
    tags,
    seo,
    shipping,
  } = req.body;

  // Get seller info (authorization middleware ensures user is seller)
  const seller = await Seller.findOne({ userId: req.user._id });
  if (!seller) {
    throw new ApiError(500, "Seller profile not found");
  }

  // Create product
  const product = await Product.create({
    sellerId: seller._id,
    title,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    sku,
    price,
    comparePrice,
    costPrice,
    images: images || [],
    inventory: {
      quantity: inventory?.quantity || 0,
      lowStockThreshold: inventory?.lowStockThreshold || 5,
      trackInventory: inventory?.trackInventory !== false,
      allowBackorder: inventory?.allowBackorder || false,
      maxOrderQuantity: inventory?.maxOrderQuantity || 10,
    },
    variants: variants || [],
    specifications: specifications || [],
    tags: tags || [],
    seo: seo || {},
    shipping: shipping || {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

/**
 * @desc    Get all products with filtering and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    status = "active",
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    featured,
    inStock,
  } = req.query;

  // Build filter object
  const filter = {};

  // Only show approved active products for public access
  if (!req.user?.role || req.user.role === "buyer") {
    filter.status = "active";
    filter.approvalStatus = "approved";
  }

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (brand) filter.brand = brand;
  if (featured === "true") filter.featured = true;
  if (status && req.user?.role !== "buyer") filter.status = status;

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Search functionality
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Stock filter
  if (inStock === "true") {
    filter.$or = [
      { "inventory.trackInventory": false },
      { "inventory.quantity": { $gt: 0 } },
      { "inventory.allowBackorder": true },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const products = await Product.find(filter)
    .populate("sellerId", "businessName")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
      },
      "Products retrieved successfully"
    )
  );
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate(
    "sellerId",
    "businessName businessDescription"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user can view this product
  if (product.status !== "active" || product.approvalStatus !== "approved") {
    if (
      !req.user ||
      (req.user.role !== "seller" && req.user.role !== "admin")
    ) {
      throw new ApiError(404, "Product not found");
    }

    // Sellers can only view their own products
    if (req.user.role === "seller") {
      const seller = await Seller.findOne({ userId: req.user._id });
      if (product.sellerId.toString() !== seller._id.toString()) {
        throw new ApiError(404, "Product not found");
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved successfully"));
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Seller - own products only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Find product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user is the seller of this product (authorization middleware ensures user is seller)
  const seller = await Seller.findOne({ userId: req.user._id });
  if (product.sellerId.toString() !== seller._id.toString()) {
    throw new ApiError(403, "You can only update your own products");
  }

  // Remove fields that shouldn't be updated directly
  delete updateData.sellerId;
  delete updateData.approvalStatus;
  delete updateData.approvalNotes;
  delete updateData.ratings;
  delete updateData.sales;

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("sellerId", "businessName");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Seller - own products only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user is the seller of this product
  const seller = await Seller.findOne({ userId: req.user._id });
  if (!seller || product.sellerId.toString() !== seller._id.toString()) {
    throw new ApiError(403, "You can only delete your own products");
  }

  // Soft delete by setting status to inactive
  await Product.findByIdAndUpdate(id, { status: "inactive" });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

/**
 * @desc    Get seller's products
 * @route   GET /api/products/seller/my-products
 * @access  Private (Seller only)
 */
const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category, search } = req.query;

  // Get seller (authorization middleware ensures user is seller)
  const seller = await Seller.findOne({ userId: req.user._id });

  // Build filter
  const filter = { sellerId: seller._id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Product.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
      },
      "Seller products retrieved successfully"
    )
  );
});

/**
 * @desc    Update product inventory
 * @route   PATCH /api/products/:id/inventory
 * @access  Private (Seller - own products only)
 */
const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, operation = "set" } = req.body;

  // Find product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user is the seller of this product (authorization middleware ensures user is seller)
  const seller = await Seller.findOne({ userId: req.user._id });
  if (product.sellerId.toString() !== seller._id.toString()) {
    throw new ApiError(403, "You can only update your own products");
  }

  // Update inventory
  if (operation === "set") {
    product.inventory.quantity = quantity;
  } else if (operation === "increase") {
    product.inventory.quantity += quantity;
  } else if (operation === "decrease") {
    if (
      product.inventory.quantity < quantity &&
      !product.inventory.allowBackorder
    ) {
      throw new ApiError(400, "Insufficient inventory");
    }
    product.inventory.quantity -= quantity;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Inventory updated successfully"));
});

/**
 * @desc    Get product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  const subcategories = await Product.distinct("subcategory");
  const brands = await Product.distinct("brand");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories: categories.filter(Boolean),
        subcategories: subcategories.filter(Boolean),
        brands: brands.filter(Boolean),
      },
      "Categories retrieved successfully"
    )
  );
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.find({
    featured: true,
    status: "active",
    approvalStatus: "approved",
  })
    .populate("sellerId", "businessName")
    .sort({ "sales.totalSold": -1, "ratings.average": -1 })
    .limit(parseInt(limit))
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Featured products retrieved successfully")
    );
});

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const relatedProducts = await Product.find({
    _id: { $ne: id },
    category: product.category,
    status: "active",
    approvalStatus: "approved",
  })
    .populate("sellerId", "businessName")
    .sort({ "sales.totalSold": -1, "ratings.average": -1 })
    .limit(parseInt(limit))
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        relatedProducts,
        "Related products retrieved successfully"
      )
    );
});

// ==================== ADMIN FUNCTIONS ====================

/**
 * @desc    Get products pending approval (Admin only)
 * @route   GET /api/products/admin/pending-approval
 * @access  Private (Admin only)
 */
const getPendingApprovalProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sellerId, category } = req.query;

  // Build filter (authorization middleware ensures user is admin)
  const filter = { approvalStatus: "pending" };
  if (sellerId) filter.sellerId = sellerId;
  if (category) filter.category = category;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const products = await Product.find(filter)
    .populate("sellerId", "businessName businessDescription")
    .sort({ createdAt: 1 }) // Oldest first
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Product.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
      },
      "Pending approval products retrieved successfully"
    )
  );
});

/**
 * @desc    Approve a product (Admin only)
 * @route   PATCH /api/products/admin/:id/approve
 * @access  Private (Admin only)
 */
const approveProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  // Find product (authorization middleware ensures user is admin)
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if product is pending approval
  if (product.approvalStatus !== "pending") {
    throw new ApiError(400, "Product is not pending approval");
  }

  // Approve product
  product.approvalStatus = "approved";
  product.approvalNotes = notes || "";
  product.status = "active"; // Set to active when approved

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product approved successfully"));
});

/**
 * @desc    Reject a product (Admin only)
 * @route   PATCH /api/products/admin/:id/reject
 * @access  Private (Admin only)
 */
const rejectProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, reason } = req.body;

  // Validate required fields (authorization middleware ensures user is admin)
  if (!notes || !reason) {
    throw new ApiError(400, "Rejection notes and reason are required");
  }

  // Find product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if product is pending approval
  if (product.approvalStatus !== "pending") {
    throw new ApiError(400, "Product is not pending approval");
  }

  // Reject product
  product.approvalStatus = "rejected";
  product.approvalNotes = notes;
  product.status = "inactive"; // Set to inactive when rejected

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product rejected successfully"));
});

/**
 * @desc    Bulk approve products (Admin only)
 * @route   PATCH /api/products/admin/bulk-approve
 * @access  Private (Admin only)
 */
const bulkApproveProducts = asyncHandler(async (req, res) => {
  const { productIds, notes } = req.body;

  // Validate input (authorization middleware ensures user is admin)
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, "Product IDs array is required");
  }

  // Update products
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      approvalStatus: "pending",
    },
    {
      approvalStatus: "approved",
      approvalNotes: notes || "",
      status: "active",
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        approvedCount: result.modifiedCount,
        totalRequested: productIds.length,
      },
      `${result.modifiedCount} products approved successfully`
    )
  );
});

/**
 * @desc    Bulk reject products (Admin only)
 * @route   PATCH /api/products/admin/bulk-reject
 * @access  Private (Admin only)
 */
const bulkRejectProducts = asyncHandler(async (req, res) => {
  const { productIds, notes, reason } = req.body;

  // Validate input (authorization middleware ensures user is admin)
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, "Product IDs array is required");
  }

  if (!notes || !reason) {
    throw new ApiError(400, "Rejection notes and reason are required");
  }

  // Update products
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      approvalStatus: "pending",
    },
    {
      approvalStatus: "rejected",
      approvalNotes: notes,
      status: "inactive",
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        rejectedCount: result.modifiedCount,
        totalRequested: productIds.length,
      },
      `${result.modifiedCount} products rejected successfully`
    )
  );
});

/**
 * @desc    Get admin dashboard stats (Admin only)
 * @route   GET /api/products/admin/dashboard
 * @access  Private (Admin only)
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  // Get various statistics (authorization middleware ensures user is admin)
  const [
    totalProducts,
    pendingApproval,
    approvedProducts,
    rejectedProducts,
    activeProducts,
    inactiveProducts,
    featuredProducts,
    lowStockProducts,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ approvalStatus: "pending" }),
    Product.countDocuments({ approvalStatus: "approved" }),
    Product.countDocuments({ approvalStatus: "rejected" }),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({ status: "inactive" }),
    Product.countDocuments({ featured: true }),
    Product.countDocuments({
      "inventory.quantity": { $lte: 5 },
      "inventory.trackInventory": true,
    }),
  ]);

  // Get recent pending products
  const recentPending = await Product.find({ approvalStatus: "pending" })
    .populate("sellerId", "businessName")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Get category distribution
  const categoryStats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalProducts,
          pendingApproval,
          approvedProducts,
          rejectedProducts,
          activeProducts,
          inactiveProducts,
          featuredProducts,
          lowStockProducts,
        },
        recentPending,
        categoryStats,
      },
      "Admin dashboard data retrieved successfully"
    )
  );
});

/**
 * @desc    Get all products for admin (with approval status)
 * @route   GET /api/products/admin/all
 * @access  Private (Admin only)
 */
const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    approvalStatus,
    status,
    sellerId,
    category,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter (authorization middleware ensures user is admin)
  const filter = {};
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (status) filter.status = status;
  if (sellerId) filter.sellerId = sellerId;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const products = await Product.find(filter)
    .populate("sellerId", "businessName businessDescription")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Product.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
      },
      "All products retrieved successfully"
    )
  );
});

/**
 * @desc    Update product approval status (Admin only)
 * @route   PATCH /api/products/admin/:id/approval-status
 * @access  Private (Admin only)
 */
const updateProductApprovalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approvalStatus, notes, reason } = req.body;

  // Validate approval status (authorization middleware ensures user is admin)
  if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
    throw new ApiError(400, "Invalid approval status");
  }

  // Validate required fields for rejection
  if (approvalStatus === "rejected" && (!notes || !reason)) {
    throw new ApiError(400, "Notes and reason are required for rejection");
  }

  // Find product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Update product
  product.approvalStatus = approvalStatus;
  product.approvalNotes = notes || "";

  // Set status based on approval status
  if (approvalStatus === "approved") {
    product.status = "active";
  } else if (approvalStatus === "rejected") {
    product.status = "inactive";
  }

  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product,
        "Product approval status updated successfully"
      )
    );
});

/**
 * @desc    Set or unset product as featured (Admin only)
 * @route   PATCH /api/products/admin/:id/featured
 * @access  Private (Admin only)
 */
const setProductFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  product.featured = featured;
  await product.save();
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product featured status updated"));
});

module.exports = {
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
  setProductFeatured,
};

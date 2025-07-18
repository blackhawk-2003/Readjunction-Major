const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");
const { ApiError } = require("../utils");
const { asyncHandler } = require("../utils");

// Helper function to validate product availability
const validateProductAvailability = async (productId) => {
  const product = await Product.findById(productId).populate("sellerId");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "approved") {
    throw new ApiError(400, "Product is not available");
  }

  return {
    productId: product._id,
    sellerId: product.sellerId._id,
    price: product.pricing.price,
    title: product.title,
    images: product.images,
    sellerName: product.sellerId.businessInfo.businessName,
  };
};

// Get user's wishlists
const getWishlists = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const wishlists = await Wishlist.find({ buyerId, isActive: true })
    .populate("items.productId", "title images category pricing")
    .populate("items.sellerId", "businessInfo.businessName")
    .sort({ isDefault: -1, lastUpdated: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Wishlist.countDocuments({ buyerId, isActive: true });

  res.status(200).json({
    success: true,
    data: {
      wishlists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get specific wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  })
    .populate("items.productId", "title images category pricing inventory")
    .populate("items.sellerId", "businessInfo.businessName");

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  res.status(200).json({
    success: true,
    data: { wishlist },
  });
});

// Create new wishlist
const createWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { name, description, isPublic } = req.body;

  // If this is the first wishlist, make it default
  const existingWishlists = await Wishlist.countDocuments({
    buyerId,
    isActive: true,
  });
  const isDefault = existingWishlists === 0;

  const wishlist = new Wishlist({
    buyerId,
    name: name || "My Wishlist",
    description,
    isPublic: isPublic || false,
    isDefault,
  });

  await wishlist.save();

  res.status(201).json({
    success: true,
    message: "Wishlist created successfully",
    data: { wishlist },
  });
});

// Add item to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { productId, notes, priority } = req.body;

  // Validate product availability
  const productDetails = await validateProductAvailability(productId);

  let wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    // Create default wishlist if none exists
    wishlist = new Wishlist({
      buyerId,
      name: "My Wishlist",
      isDefault: true,
    });
  }

  // Add item to wishlist
  wishlist.addItem(
    productId,
    productDetails.sellerId,
    productDetails,
    notes,
    priority
  );
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Item added to wishlist successfully",
    data: { wishlist },
  });
});

// Update wishlist item
const updateWishlistItem = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId, productId } = req.params;
  const { notes, priority } = req.body;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const item = wishlist.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!item) {
    throw new ApiError(404, "Item not found in wishlist");
  }

  if (notes !== undefined) {
    wishlist.updateItemNotes(productId, notes);
  }

  if (priority !== undefined) {
    wishlist.updateItemPriority(productId, priority);
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Wishlist item updated successfully",
    data: { wishlist },
  });
});

// Remove item from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId, productId } = req.params;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.removeItem(productId);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Item removed from wishlist successfully",
    data: { wishlist },
  });
});

// Update wishlist settings
const updateWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { name, description, isPublic } = req.body;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  if (name !== undefined) wishlist.name = name;
  if (description !== undefined) wishlist.description = description;
  if (isPublic !== undefined) wishlist.isPublic = isPublic;

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Wishlist updated successfully",
    data: { wishlist },
  });
});

// Delete wishlist
const deleteWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  if (wishlist.isDefault) {
    throw new ApiError(400, "Cannot delete default wishlist");
  }

  wishlist.isActive = false;
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Wishlist deleted successfully",
  });
});

// Move items from wishlist to cart
const moveToCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { productIds, quantities = {} } = req.body;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const movedItems = [];
  const errors = [];

  for (const productId of productIds) {
    try {
      const item = wishlist.moveToCart(productId);
      if (item) {
        const quantity = quantities[productId] || 1;
        item.quantity = quantity;
        movedItems.push(item);
      }
    } catch (error) {
      errors.push({ productId, error: error.message });
    }
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Items moved to cart successfully",
    data: {
      movedItems,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});

// Get wishlist items with filtering
const getWishlistItems = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const {
    priority,
    hasPriceDrop,
    sortBy = "addedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  let items = [...wishlist.items];

  // Filter by priority
  if (priority) {
    items = items.filter((item) => item.priority === priority);
  }

  // Filter by price drop
  if (hasPriceDrop === "true") {
    items = items.filter((item) => item.priceDrop);
  }

  // Sort items
  const sortOptions = {
    addedAt: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
    priority: (a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    },
    price: (a, b) =>
      (b.currentPrice || b.priceWhenAdded) -
      (a.currentPrice || a.priceWhenAdded),
    name: (a, b) => a.productName.localeCompare(b.productName),
  };

  if (sortOptions[sortBy]) {
    items.sort(sortOptions[sortBy]);
    if (sortOrder === "asc") {
      items.reverse();
    }
  }

  // Pagination
  const skip = (page - 1) * limit;
  const paginatedItems = items.slice(skip, skip + parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      items: paginatedItems,
      totalItems: items.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: items.length,
        pages: Math.ceil(items.length / limit),
      },
    },
  });
});

// Check for price drops
const checkPriceDrops = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  // Get current prices for all products in wishlist
  const productIds = wishlist.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const currentPrices = {};
  products.forEach((product) => {
    currentPrices[product._id.toString()] = product.pricing.price;
  });

  // Check for price drops
  const priceDrops = wishlist.checkPriceDrops(currentPrices);
  await wishlist.save();

  res.status(200).json({
    success: true,
    data: {
      priceDrops,
      totalDrops: priceDrops.length,
    },
  });
});

// Share wishlist
const shareWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { isPublic, shareWith } = req.body;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.isPublic = isPublic;
  await wishlist.save();

  // In a real app, you would send emails to shareWith users
  const shareData = {
    wishlistId: wishlist._id,
    wishlistName: wishlist.name,
    isPublic: wishlist.isPublic,
    shareUrl: isPublic ? `/wishlist/${wishlist._id}` : null,
    sharedWith: shareWith || [],
  };

  res.status(200).json({
    success: true,
    message: "Wishlist shared successfully",
    data: { shareData },
  });
});

// Copy wishlist
const copyWishlist = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { name, description, includeItems = true } = req.body;

  const originalWishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!originalWishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const newWishlist = new Wishlist({
    buyerId,
    name,
    description,
    isPublic: false,
    isDefault: false,
    items: includeItems ? originalWishlist.items : [],
  });

  await newWishlist.save();

  res.status(201).json({
    success: true,
    message: "Wishlist copied successfully",
    data: { wishlist: newWishlist },
  });
});

// Bulk operations on wishlist
const bulkWishlistOperation = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { wishlistId } = req.params;
  const { productIds, operation, priority, notes } = req.body;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    buyerId,
    isActive: true,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const results = {
    success: [],
    errors: [],
  };

  for (const productId of productIds) {
    try {
      switch (operation) {
        case "remove":
          wishlist.removeItem(productId);
          results.success.push({ productId, operation: "removed" });
          break;
        case "updatePriority":
          if (priority) {
            wishlist.updateItemPriority(productId, priority);
            results.success.push({ productId, operation: "priority_updated" });
          }
          break;
        case "updateNotes":
          if (notes) {
            wishlist.updateItemNotes(productId, notes);
            results.success.push({ productId, operation: "notes_updated" });
          }
          break;
        default:
          results.errors.push({ productId, error: "Invalid operation" });
      }
    } catch (error) {
      results.errors.push({ productId, error: error.message });
    }
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Bulk operation completed",
    data: { results },
  });
});

// Get public wishlist (for sharing)
const getPublicWishlist = asyncHandler(async (req, res) => {
  const { wishlistId } = req.params;

  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    isPublic: true,
    isActive: true,
  })
    .populate("items.productId", "title images category pricing")
    .populate("items.sellerId", "businessInfo.businessName");

  if (!wishlist) {
    throw new ApiError(404, "Public wishlist not found");
  }

  res.status(200).json({
    success: true,
    data: { wishlist },
  });
});

module.exports = {
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
};

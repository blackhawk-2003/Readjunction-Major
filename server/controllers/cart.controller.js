const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const { ApiError } = require("../utils");
const { asyncHandler } = require("../utils");

// Helper function to validate product availability
const validateProductAvailability = async (productId, quantity) => {
  const product = await Product.findById(productId).populate("sellerId");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "active" || product.approvalStatus !== "approved") {
    console.log(product.status, product.approvalStatus);
    throw new ApiError(400, "Product is not available for purchase");
  }

  if (product.inventory.quantity < quantity) {
    throw new ApiError(
      400,
      `Insufficient stock. Available: ${product.inventory.quantity}`
    );
  }

  return {
    productId: product._id,
    sellerId: product.sellerId._id,
    price: product.price,
    title: product.title,
    images: product.images || [],
    sellerName: product.sellerId.businessName,
  };
};

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  let cart = await Cart.findOne({ buyerId, isActive: true })
    .populate("items.productId", "title images category inventory pricing")
    .populate("items.sellerId", "businessInfo.businessName");

  if (!cart) {
    // Create empty cart if it doesn't exist
    cart = new Cart({ buyerId });
    await cart.save();
  } else {
    // Fix any invalid data before calculating totals
    if (cart.appliedCoupon) {
      if (!cart.appliedCoupon.discount || cart.appliedCoupon.discount === "") {
        cart.appliedCoupon.discount = 0;
      }
      if (!cart.appliedCoupon.discountType) {
        cart.appliedCoupon.discountType = "fixed";
      }
    }

    // Ensure totals are properly initialized
    if (!cart.totals) {
      cart.totals = {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };
    }

    // Ensure totals are calculated
    cart.calculateTotals();
    await cart.save();
  }

  // Ensure each item has a productImage
  if (cart.items && cart.items.length > 0) {
    cart.items.forEach((item) => {
      if (
        !item.productImage &&
        item.productId &&
        item.productId.images &&
        item.productId.images.length > 0
      ) {
        const firstImage = item.productId.images[0];
        item.productImage = firstImage.url || firstImage;
      }
      if (!item.productImage) {
        item.productImage = "/placeholder-image.jpg";
      }
    });
  }

  res.status(200).json({
    success: true,
    data: { cart },
  });
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { productId, quantity = 1, notes } = req.body;

  // Validate product availability
  const productDetails = await validateProductAvailability(productId, quantity);

  let cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    cart = new Cart({ buyerId });
  }

  // Ensure product image is available
  const productImage =
    productDetails.images && productDetails.images.length > 0
      ? productDetails.images[0].url || productDetails.images[0]
      : "/placeholder-image.jpg";

  // Add item to cart
  cart.addItem(productId, productDetails.sellerId, quantity, {
    ...productDetails,
    images: productDetails.images || [],
    productImage: productImage,
  });

  // Add notes if provided
  if (notes) {
    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (item) {
      item.notes = notes;
    }
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: { cart },
  });
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { productId } = req.params;
  const { quantity, notes } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Validate new quantity
  if (quantity) {
    await validateProductAvailability(productId, quantity);
    cart.updateItemQuantity(productId, quantity);
  }

  // Update notes if provided
  if (notes !== undefined) {
    item.notes = notes;
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: { cart },
  });
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.removeItem(productId);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: { cart },
  });
});

// Update item selection
const updateItemSelection = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { productId } = req.params;
  const { isSelected } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.toggleItemSelection(productId);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item selection updated successfully",
    data: { cart },
  });
});

// Update shipping address
const updateShippingAddress = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const shippingAddress = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.shippingAddress = shippingAddress;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Shipping address updated successfully",
    data: { cart },
  });
});

// Update shipping method
const updateShippingMethod = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { shippingMethod } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.shippingMethod = shippingMethod;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Shipping method updated successfully",
    data: { cart },
  });
});

// Update payment method
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { paymentMethod } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.paymentMethod = paymentMethod;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Payment method updated successfully",
    data: { cart },
  });
});

// Apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { code } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Mock coupon validation - in real app, validate against coupon database
  const mockCoupons = {
    WELCOME10: { discount: 10, discountType: "percentage" },
    SAVE50: { discount: 50, discountType: "fixed" },
    FREESHIP: { discount: 0, discountType: "fixed" }, // Free shipping
  };

  const coupon = mockCoupons[code];
  if (!coupon) {
    throw new ApiError(400, "Invalid coupon code");
  }

  cart.appliedCoupon = {
    code,
    discount: coupon.discount,
    discountType: coupon.discountType,
  };

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: { cart },
  });
});

// Remove coupon
const removeCoupon = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.appliedCoupon = null;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
    data: { cart },
  });
});

// Bulk update cart
const bulkUpdateCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { items } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Validate all items first
  for (const item of items) {
    await validateProductAvailability(item.productId, item.quantity);
  }

  // Update cart items
  for (const item of items) {
    const cartItem = cart.items.find(
      (cartItem) => cartItem.productId.toString() === item.productId
    );
    if (cartItem) {
      cartItem.quantity = item.quantity;
      if (item.isSelected !== undefined) {
        cartItem.isSelected = item.isSelected;
      }
    }
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: { cart },
  });
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.clearCart();
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: { cart },
  });
});

// Get cart summary
const getCartSummary = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalItems: 0,
          selectedItems: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
        },
      },
    });
  }

  const selectedItems = cart.items.filter((item) => item.isSelected);
  const summary = {
    totalItems: cart.items.length,
    selectedItems: selectedItems.length,
    subtotal: cart.totals.subtotal,
    tax: cart.totals.tax,
    shipping: cart.totals.shipping,
    discount: cart.totals.discount,
    total: cart.totals.total,
  };

  res.status(200).json({
    success: true,
    data: { summary },
  });
});

// Move items from wishlist to cart
const moveFromWishlistToCart = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { productIds, quantities = {} } = req.body;

  const cart = await Cart.findOne({ buyerId, isActive: true });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const addedItems = [];
  const errors = [];

  for (const productId of productIds) {
    try {
      const quantity = quantities[productId] || 1;
      const productDetails = await validateProductAvailability(
        productId,
        quantity
      );

      cart.addItem(
        productId,
        productDetails.sellerId,
        quantity,
        productDetails
      );
      addedItems.push({ productId, quantity });
    } catch (error) {
      errors.push({ productId, error: error.message });
    }
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Items moved to cart successfully",
    data: {
      cart,
      addedItems,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});

// Get cart for checkout (selected items only)
const getCartForCheckout = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyerId, isActive: true });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const selectedItems = cart.getSelectedItems();

  if (selectedItems.length === 0) {
    throw new ApiError(400, "No items selected for checkout");
  }

  // Validate all selected items
  for (const item of selectedItems) {
    await validateProductAvailability(item.productId, item.quantity);
  }

  const checkoutData = {
    items: selectedItems,
    shippingAddress: cart.shippingAddress,
    shippingMethod: cart.shippingMethod,
    paymentMethod: cart.paymentMethod,
    appliedCoupon: cart.appliedCoupon,
    totals: cart.totals,
  };

  res.status(200).json({
    success: true,
    data: { checkoutData },
  });
});

module.exports = {
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
};

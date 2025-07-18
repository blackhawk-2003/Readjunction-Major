const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "My Wishlist",
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          maxlength: 200,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        priceWhenAdded: {
          type: Number,
        },
        currentPrice: {
          type: Number,
        },
        priceDrop: {
          type: Boolean,
          default: false,
        },
        productName: {
          type: String,
          required: true,
        },
        productImage: {
          type: String,
        },
        sellerName: {
          type: String,
          required: true,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Update totalItems and totalValue before saving
wishlistSchema.pre("save", function (next) {
  this.totalItems = this.items.length;
  this.totalValue = this.items.reduce((sum, item) => {
    return sum + (item.currentPrice || item.priceWhenAdded || 0);
  }, 0);
  this.lastUpdated = new Date();
  next();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function (
  productId,
  sellerId,
  productDetails,
  notes = "",
  priority = "medium"
) {
  const existingItem = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!existingItem) {
    this.items.push({
      productId,
      sellerId,
      addedAt: new Date(),
      notes,
      priority,
      priceWhenAdded: productDetails.price,
      currentPrice: productDetails.price,
      productName: productDetails.title,
      productImage: productDetails.images[0] || "",
      sellerName: productDetails.sellerName,
    });
  }
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
};

// Method to update item notes
wishlistSchema.methods.updateItemNotes = function (productId, notes) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (item) {
    item.notes = notes;
  }
};

// Method to update item priority
wishlistSchema.methods.updateItemPriority = function (productId, priority) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (item) {
    item.priority = priority;
  }
};

// Method to move item to cart (returns item details for cart)
wishlistSchema.methods.moveToCart = function (productId) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (item) {
    // Remove from wishlist
    this.removeItem(productId);
    // Return item details for cart
    return {
      productId: item.productId,
      sellerId: item.sellerId,
      quantity: 1,
      price: item.currentPrice || item.priceWhenAdded,
      productName: item.productName,
      productImage: item.productImage,
      sellerName: item.sellerName,
    };
  }
  return null;
};

// Method to check for price drops
wishlistSchema.methods.checkPriceDrops = function (currentPrices) {
  let priceDrops = [];

  this.items.forEach((item) => {
    const currentPrice = currentPrices[item.productId.toString()];
    if (currentPrice && currentPrice < item.priceWhenAdded) {
      item.currentPrice = currentPrice;
      item.priceDrop = true;
      priceDrops.push({
        productId: item.productId,
        productName: item.productName,
        oldPrice: item.priceWhenAdded,
        newPrice: currentPrice,
        savings: item.priceWhenAdded - currentPrice,
      });
    }
  });

  return priceDrops;
};

// Method to get items by priority
wishlistSchema.methods.getItemsByPriority = function (priority) {
  return this.items.filter((item) => item.priority === priority);
};

// Method to get items with price drops
wishlistSchema.methods.getItemsWithPriceDrops = function () {
  return this.items.filter((item) => item.priceDrop);
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function () {
  this.items = [];
};

// Indexes for better performance
wishlistSchema.index({ buyerId: 1 });
wishlistSchema.index({ "items.productId": 1 });
wishlistSchema.index({ isPublic: 1 });
wishlistSchema.index({ isDefault: 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);

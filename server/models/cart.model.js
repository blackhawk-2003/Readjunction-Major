const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 100,
        },
        price: {
          type: Number,
          required: true,
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
        addedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          maxlength: 200,
        },
        isSelected: {
          type: Boolean,
          default: true,
        },
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "overnight"],
      default: "standard",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "card", "upi", "wallet"],
    },
    appliedCoupon: {
      code: String,
      discount: Number,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },
    },
    totals: {
      subtotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
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

// Calculate cart totals before saving
cartSchema.pre("save", function (next) {
  // Ensure appliedCoupon is properly structured
  if (this.appliedCoupon) {
    if (!this.appliedCoupon.discount || this.appliedCoupon.discount === "") {
      this.appliedCoupon.discount = 0;
    }
    if (!this.appliedCoupon.discountType) {
      this.appliedCoupon.discountType = "fixed";
    }
  }

  this.calculateTotals();
  this.lastUpdated = new Date();
  next();
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function () {
  const selectedItems = this.items.filter((item) => item.isSelected);

  // Calculate subtotal
  const subtotal = selectedItems.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // Calculate tax (18% GST)
  const tax = subtotal * 0.18;

  // Calculate shipping cost
  const shippingCosts = {
    standard: 50,
    express: 100,
    overnight: 200,
  };
  const shipping = shippingCosts[this.shippingMethod] || 0;

  // Calculate discount
  let discount = 0;
  if (this.appliedCoupon && this.appliedCoupon.discount) {
    if (this.appliedCoupon.discountType === "percentage") {
      discount = (subtotal * this.appliedCoupon.discount) / 100;
    } else {
      discount = this.appliedCoupon.discount;
    }
    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);
  }

  // Calculate total
  const total = subtotal + tax + shipping - discount;

  // Ensure all values are numbers and not empty strings
  this.totals = {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };

  // Ensure no empty strings or invalid values
  Object.keys(this.totals).forEach((key) => {
    if (
      this.totals[key] === "" ||
      this.totals[key] === null ||
      this.totals[key] === undefined
    ) {
      this.totals[key] = 0;
    }
    this.totals[key] = Number(this.totals[key]) || 0;
  });
};

// Method to add item to cart
cartSchema.methods.addItem = function (
  productId,
  sellerId,
  quantity,
  productDetails
) {
  const existingItemIndex = this.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Extract image URL properly
    let productImage = "";
    if (productDetails.images && productDetails.images.length > 0) {
      const firstImage = productDetails.images[0];
      productImage = firstImage.url || firstImage || "";
    }

    // Add new item
    this.items.push({
      productId,
      sellerId,
      quantity,
      price: productDetails.price,
      productName: productDetails.title,
      productImage: productImage,
      sellerName: productDetails.sellerName,
      addedAt: new Date(),
    });
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (item) {
    item.quantity = Math.max(1, Math.min(100, quantity));
    item.addedAt = new Date();
  }
};

// Method to toggle item selection
cartSchema.methods.toggleItemSelection = function (productId) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (item) {
    item.isSelected = !item.isSelected;
  }
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.appliedCoupon = null;
  this.calculateTotals();
};

// Method to get selected items
cartSchema.methods.getSelectedItems = function () {
  return this.items.filter((item) => item.isSelected);
};

// Indexes for better performance
cartSchema.index({ buyerId: 1 });
cartSchema.index({ "items.productId": 1 });
cartSchema.index({ "items.sellerId": 1 });

module.exports = mongoose.model("Cart", cartSchema);

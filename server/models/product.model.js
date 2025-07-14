const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    inventory: {
      quantity: { type: Number, default: 0, min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      trackInventory: { type: Boolean, default: true },
      allowBackorder: { type: Boolean, default: false },
      maxOrderQuantity: { type: Number, default: 10 },
    },
    variants: [
      {
        name: { type: String, required: true }, // e.g., "Size", "Color"
        options: [{ type: String }], // e.g., ["S", "M", "L"] or ["Red", "Blue"]
        priceModifier: { type: Number, default: 0 }, // Additional cost for this variant
      },
    ],
    specifications: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "pending_approval"],
      default: "draft",
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNotes: {
      type: String,
    },
    seo: {
      metaTitle: { type: String, maxlength: 60 },
      metaDescription: { type: String, maxlength: 160 },
      slug: { type: String, unique: true, sparse: true },
    },
    shipping: {
      weight: { type: Number, min: 0 }, // in grams
      dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
      },
      freeShipping: { type: Boolean, default: false },
      shippingClass: { type: String },
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    sales: {
      totalSold: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    featured: { type: Boolean, default: false },
    featuredUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ sellerId: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1, status: 1 });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ "ratings.average": -1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ "sales.totalSold": -1, status: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
    );
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual("inStock").get(function () {
  if (!this.inventory.trackInventory) return true;
  return this.inventory.quantity > 0 || this.inventory.allowBackorder;
});

// Virtual for low stock status
productSchema.virtual("lowStock").get(function () {
  if (!this.inventory.trackInventory) return false;
  return (
    this.inventory.quantity <= this.inventory.lowStockThreshold &&
    this.inventory.quantity > 0
  );
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to find products by seller
productSchema.statics.findBySeller = function (sellerId, options = {}) {
  const query = { sellerId, ...options };
  return this.find(query).populate("sellerId", "businessName");
};

// Static method to find active products
productSchema.statics.findActive = function (filters = {}) {
  return this.find({
    status: "active",
    approvalStatus: "approved",
    ...filters,
  });
};

// Instance method to update inventory
productSchema.methods.updateInventory = function (
  quantity,
  operation = "decrease"
) {
  if (!this.inventory.trackInventory) return true;

  if (operation === "decrease") {
    if (this.inventory.quantity < quantity && !this.inventory.allowBackorder) {
      throw new Error("Insufficient inventory");
    }
    this.inventory.quantity -= quantity;
  } else if (operation === "increase") {
    this.inventory.quantity += quantity;
  }

  return this.save();
};

// Instance method to check if product can be ordered
productSchema.methods.canBeOrdered = function (quantity = 1) {
  if (this.status !== "active" || this.approvalStatus !== "approved") {
    return false;
  }

  if (quantity > this.inventory.maxOrderQuantity) {
    return false;
  }

  if (this.inventory.trackInventory) {
    return this.inventory.quantity >= quantity || this.inventory.allowBackorder;
  }

  return true;
};

module.exports = mongoose.model("Product", productSchema);

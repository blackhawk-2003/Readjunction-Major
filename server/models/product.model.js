const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    inventory: {
      quantity: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

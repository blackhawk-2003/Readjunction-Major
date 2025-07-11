const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    businessDescription: { type: String },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "United States" },
    },
    taxId: { type: String, required: true },
    bankDetails: {
      accountNumber: String,
      routingNumber: String,
      bankName: String,
      accountHolderName: String,
    },
    isApproved: { type: Boolean, default: false },
    approvalDate: Date,
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);

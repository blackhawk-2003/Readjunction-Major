const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    payment: {
      method: String,
      status: String,
      transactionId: String,
      amount: Number,
    },
    shipping: {
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      method: String,
      cost: Number,
      trackingNumber: String,
    },
    totals: {
      subtotal: Number,
      tax: Number,
      shipping: Number,
      discount: Number,
      total: Number,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

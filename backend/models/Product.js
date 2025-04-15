const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    author: String,
    isbn: String,
    publisher: String,
    publicationDate: String,
    edition: String,
    description: String,
    minBid: Number,
    seller: String,
    sellerEmail: String,
    sellerPhone: Number,
    currentBid: Number,
    bidderEmail: String,
    winnerEmail: String,
    offerTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: true },
    // New payment-related fields
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed", "refunded"], 
      default: "pending" 
    },
    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentTransaction" 
    },
    paymentDate: { 
      type: Date 
    }
  }
);

module.exports = mongoose.model("Product", ProductSchema);
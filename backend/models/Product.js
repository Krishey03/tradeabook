const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  image: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    trim: true,
  },
  isbn: {
    type: String,
    trim: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  publicationDate: {
    type: String,
    trim: true,
  },
  edition: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  minBid: {
    type: Number,
    required: true,
    min: 0,
  },
  currentBid: {
    type: Number,
    default: 0,
    min: 0,
  },
  seller: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  sellerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  sellerPhone: {
    type: String,
    trim: true,
  },
  bidderEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  winnerEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  offerTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
    index: true,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentTransaction",
  },
  paymentDate: {
    type: Date,
  },
  paymentExpiresAt: {
    type: Date,
  },

  bids: [
    {
      amount: { type: Number, required: true },
      email: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],

  exchangeOffers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "eProduct",
    },
  ],
}, {
  timestamps: true, 
});

module.exports = mongoose.model("Product", ProductSchema);

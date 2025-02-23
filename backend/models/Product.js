const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    images: [{ type: String, required: true }],

    // This field tracks who listed the product.
    // It doesn't imply a special "seller" role—it's just the user that created the listing.
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Bidding is always enabled.
    minBid: { type: Number, required: true, default: 1 },
    bids: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        bidAt: { type: Date, default: Date.now }
      }
    ],

    //Exchange details.
    exchangeAvailable: { type: Boolean, default: false },
    preferredExchangeBooks: [{ type: String }],

    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Acceptable", "Poor"],
      required: true
    },

    status: {
      type: String,
      enum: ["Available", "Sold", "Pending", "Removed"],
      default: "Available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);

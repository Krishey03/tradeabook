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
    endTime: { type: Date, required: true },
  }
);

module.exports = mongoose.model("Product", ProductSchema);

const mongoose = require("mongoose");

const eProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Link to Product schema
    userEmail: { type: String, required: true }, // Email of the user offering the exchange
    exchangeOffer: {
      eTitle: { type: String, required: true },
      eAuthor: { type: String, required: true },
      eIsbn: { type: String, required: true },
      ePublisher: { type: String, required: true },
      ePublicationDate: { type: String, required: true },
      eEdition: { type: String, required: true },
      eDescription: { type: String, required: true },
    },
    offerStatus: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending", // Default status is pending
    },
    dateOffered: { type: Date, default: Date.now }, // Track when the offer was made
  }
);

module.exports = mongoose.model("eProduct", eProductSchema);
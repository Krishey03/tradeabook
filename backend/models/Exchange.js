const mongoose = require("mongoose");

const eProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, 
    userEmail: { type: String, required: true }, 
    exchangeOffer: {
      eTitle: { type: String, required: true },
      eAuthor: { type: String, required: true },
      eIsbn: { type: String, required: true },
      ePublisher: { type: String, required: true },
      ePublicationDate: { type: String, required: true },
      eEdition: { type: String, required: true },
      eDescription: { type: String, required: true },
      eBuyerPhone: { type: Number, required: true },
    },
    offerStatus: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending", 
    },
    dateOffered: { type: Date, default: Date.now }, 
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed", "refunded"], 
      default: "pending" 
    },
    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentTransaction" 
    },
    paymentDate: Date,
    paymentExpiresAt: Date
  },


);

module.exports = mongoose.model("eProduct", eProductSchema);
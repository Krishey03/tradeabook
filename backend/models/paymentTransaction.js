const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, refPath: 'productModel' },
  productModel: { type: String, enum: ['Product', 'eProduct'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["khalti"], required: true },
  status: { type: String, enum: ["pending", "completed", "refunded"], default: "pending" },
  pidx: { type: String },
  transactionDetails: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PaymentTransaction", paymentSchema);

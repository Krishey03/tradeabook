const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./routes/auth/auth-routes');
const bcrypt = require('bcryptjs');
const adminProductsRouter = require('./routes/admin/products-routes');
const shopProductsRouter = require('./routes/shop/products-routes');
const http = require('http');
const { Server } = require('socket.io');
const { initializeKhaltiPayment, verifyKhaltiPayment } = require("./khalti");
const Payment = require("./models/paymentModel");
const Product = require("./models/Product");
const eProduct = require("./models/Exchange");
const adminRoutes = require('./routes/admin/admin-routes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    },
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect('mongodb+srv://dbuser:test123@cluster0.nwtjx.mongodb.net/')
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log(error));

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Create payment model for tracking payments
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

const PaymentTransaction = mongoose.model("PaymentTransaction", paymentSchema);

// Initialize Khalti payment for products
app.post("/api/initialize-product-payment", async (req, res) => {
  try {
    const { productId, productType, website_url } = req.body;
    
    let productData;
    let productName;
    let amount;
    
    if (productType === 'Product') {
      productData = await Product.findById(productId);
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      productName = productData.title;
      amount = productData.currentBid || productData.minBid;
    } else if (productType === 'eProduct') {
      productData = await eProduct.findById(productId);
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: "Exchange product not found"
        });
      }
      
      // Get the original product to get its price
      const originalProduct = await Product.findById(productData.productId);
      if (!originalProduct) {
        return res.status(404).json({
          success: false,
          message: "Original product not found"
        });
      }
      
      productName = originalProduct.title;
      // For exchange products, you might charge a service fee or other amount
      amount = 100; // Example: Nominal fee for exchange processing (Rs. 1)
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid product type"
      });
    }
    
    // Convert to paisa (Khalti uses paisa as base unit)
    const amountInPaisa = amount * 100;
    
    // Create a payment record
    const paymentRecord = await PaymentTransaction.create({
      productId: productId,
      productModel: productType,
      amount: amountInPaisa,
      paymentMethod: "khalti"
    });
    
    // Initialize payment with Khalti
    const paymentInitiate = await initializeKhaltiPayment({
      amount: amountInPaisa,
      purchase_order_id: paymentRecord._id.toString(),
      purchase_order_name: productName,
      return_url: `${process.env.BACKEND_URI}/api/complete-khalti-payment`,
      website_url,
    });
    
// Update the payment record with the pidx
await PaymentTransaction.findByIdAndUpdate(
  paymentRecord._id,
  { pidx: paymentInitiate.pidx }
);

    res.json({
      success: true,
      payment: paymentInitiate,
      paymentRecord
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message
    });
  }
});

// Handle Khalti payment verification callback
app.get("/api/complete-khalti-payment", async (req, res) => {
  try {
    const { pidx } = req.query;
    
    if (!pidx) {
      console.error("Missing pidx in callback");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Missing payment identifier"
      });
    }
    
    console.log("Verifying payment with pidx:", pidx);
    
    // Verify the payment with Khalti
    const verificationResponse = await verifyKhaltiPayment(pidx);
    console.log("Khalti verification response:", JSON.stringify(verificationResponse, null, 2));
    
    // Find the payment record by pidx
    const paymentRecord = await PaymentTransaction.findOne({ pidx: pidx });

    if (!paymentRecord) {
      console.error("Payment record not found for pidx:", pidx);
      return res.redirect(`http://localhost:5173/payment-failed?reason=record_not_found`);
    }
    
    // Update the payment record
    paymentRecord.status = "completed";
    paymentRecord.transactionDetails = verificationResponse;
    await paymentRecord.save();
    
    // Update product or eProduct status based on payment
    if (paymentRecord.productModel === 'Product') {
      await Product.findByIdAndUpdate(paymentRecord.productId, {
        $set: {
          paymentStatus: "paid",
          paymentDate: new Date(),
          paymentId: paymentRecord._id
        }
      });
    } else if (paymentRecord.productModel === 'eProduct') {
      await eProduct.findByIdAndUpdate(paymentRecord.productId, {
        $set: {
          offerStatus: "accepted",
          paymentStatus: "paid",
          paymentDate: new Date(),
          paymentId: paymentRecord._id
        }
      });
    }
    
    // Redirect to success page with the correct parameter
    return res.redirect(`http://localhost:5173/payment-success?purchase_order_id=${paymentRecord._id}`);
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.redirect(`http://localhost:5173/payment-failed?reason=verification_error`);
  }
});

// Get payment status
app.get("/api/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await PaymentTransaction.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get payment details",
      error: error.message
    });
  }
});

app.use("/api/auth", authRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/shop/products', shopProductsRouter);
app.use('/api/admin', adminRoutes);

app.set('io', io);
app.options('*', cors(corsOptions));

server.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Routers
const authRouter = require('./routes/auth/auth-routes');
const adminProductsRouter = require('./routes/admin/products-routes');
const shopProductsRouter = require('./routes/shop/products-routes');
const orderRoutes = require('./routes/shop/order-routes');
const adminRoutes = require('./routes/admin/admin-routes');

// Models
const Payment = require("./models/paymentModel");
const Product = require("./models/Product");
const eProduct = require("./models/Exchange");
const PaymentTransaction = require('./models/paymentTransaction');

// Khalti
const { initializeKhaltiPayment, verifyKhaltiPayment } = require("./khalti");

const app = express();
const server = http.createServer(app);

// Allowed origins for frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://tradeabook.vercel.app",
  "https://tradeabook-git-main-bhattaraikrish478vercel-gmailcoms-projects.vercel.app",
  "https://tradeabook-ldjrnapat-bhattaraikrish478vercel-gmailcoms-projects.vercel.app",
  "https://tradeabook-7445mtljf-bhattaraikrish478vercel-gmailcoms-projects.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
});

app.set('io', io);

// Initialize Khalti payment for products
app.post("/api/initialize-product-payment", async (req, res) => {
  try {
    const { productId, productType, website_url } = req.body;
    const PROCESSING_FEE = 5;
    const DELIVERY_FEE = 25;
    const EXCHANGE_FEE = 55;
    
    let productData;
    let productName;
    let baseAmount;
    let totalAmount;

    if (productType === 'Product') {
      productData = await Product.findById(productId);
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      productName = productData.title;
      baseAmount = Number(productData.currentBid || productData.minBid);
      totalAmount = baseAmount + PROCESSING_FEE + DELIVERY_FEE;

    } else if (productType === 'eProduct') {
      productData = await eProduct.findById(productId);
      if (!productData) {
        return res.status(404).json({
          success: false,
          message: "Exchange product not found"
        });
      }
      
      const originalProduct = await Product.findById(productData.productId);
      if (!originalProduct) {
        return res.status(404).json({
          success: false,
          message: "Original product not found"
        });
      }
      
      productName = originalProduct.title;
      // Exchange processing fee only
      baseAmount = 0;
      totalAmount = baseAmount + EXCHANGE_FEE;
    }

    // Convert to paisa (Khalti uses paisa as base unit)
    const amountInPaisa = totalAmount * 100;
    
    // Create payment record
    const paymentRecord = await PaymentTransaction.create({
      productId: productId,
      productModel: productType,
      baseAmount: baseAmount,
      processingFee: PROCESSING_FEE,
      deliveryFee: productType === 'Product' ? DELIVERY_FEE : 0,
      amount: totalAmount,
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

    // Update payment record with pidx
    await PaymentTransaction.findByIdAndUpdate(
      paymentRecord._id,
      { pidx: paymentInitiate.pidx }
    );

    res.json({
      success: true,
      payment: paymentInitiate,
      paymentRecord,
      feeBreakdown: {
        baseAmount,
        processingFee: PROCESSING_FEE,
        deliveryFee: productType === 'Product' ? DELIVERY_FEE : 0
      }
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


// Routes
app.use("/auth", authRouter);
app.use("/admin/products", adminProductsRouter);
app.use("/shop/products", shopProductsRouter);
app.use("/admin", adminRoutes);
app.use("/shop/orders", orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
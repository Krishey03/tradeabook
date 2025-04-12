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
const PurchasedItem = require("./models/purchasedItemModel");
const Item = require("./models/itemModel");
const adminRoutes = require('./routes/admin/admin-routes');



const app = express();
const server = http.createServer(app);  // Create the HTTP server using Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Your front-end URL
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

app.post("/initialize-khali", async (req, res) => {
    console.log("body", req.body);
    try {
      //try catch for error handling
      const { itemId, totalPrice, website_url } = req.body;
      
      const itemData = await Item.findOne({
        _id: itemId,
        price: Number(totalPrice),
      });
  
      if (!itemData) {
        return res.status(400).send({
          success: false,
          message: "item not found",
        });
      }
      // creating a purchase document to store purchase info
      const purchasedItemData = await PurchasedItem.create({
        item: itemId,
        paymentMethod: "khalti",
        totalPrice: totalPrice * 100,
      });
  
      const paymentInitate = await initializeKhaltiPayment({
        amount: totalPrice * 100, // amount should be in paisa (Rs * 100)
        purchase_order_id: purchasedItemData._id, // purchase_order_id because we need to verify it later
        purchase_order_name: itemData.name,
        return_url: `${process.env.BACKEND_URI}/complete-khalti-payment`, // it can be even managed from frontedn
        website_url,
      });
  
      res.json({
        success: true,
        purchasedItemData,
        payment: paymentInitate,
      });
    } catch (error) {
      res.json({
        success: false,
        error,
      });
    }
  });

  app.get("/create-item", async (req, res) => {
    let itemData = await Item.create({
      name: "Headphone",
      price: 500,
      inStock: true,
      category: "vayo pardaina",
    });
    res.json({
      success: true,
      item: itemData,
    });
  });
  




app.use(cors(corsOptions)); // Apply CORS settings

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/shop/products', shopProductsRouter);
app.use('/api/admin', adminRoutes);

// Pass 'io' to your routes, where necessary
app.set('io', io);

app.options('*', cors(corsOptions));  // Preflight requests for all routes

// Start the server
server.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

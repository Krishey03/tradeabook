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

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/shop/products', shopProductsRouter);

// Pass 'io' to your routes, where necessary
app.set('io', io);

// Start the server
server.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

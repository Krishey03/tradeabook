const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./routes/auth/auth-routes')
const bcrypt = require('bcryptjs');


const app = express();
const PORT = process.env.PORT || 5000;

mongoose
    .connect('mongodb+srv://dbuser:test123@cluster0.nwtjx.mongodb.net/')
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log(error));

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
         ],
        credentials: true,
    })
)   
    
app.use(cookieParser())
app.use(express.json())
app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Register User
const registerUser = async (req, res) => {

    console.log("📥 Received body:", req.body);  // Log the received body


    const { userName, email, password } = req.body;

    try {
        // Validate that all fields are present
        if (!userName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({
            success: false,
            message: "An error occurred during registration.",
        });
    }
};

// Login User
const login = async (req, res) => {
    const { email, password } = req.body; // Removed userName (not needed for login)

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, userName: user.userName },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (e) {
        console.error("❌ Login Error:", e);
        res.status(500).json({
            success: false,
            message: "An error occurred during login.",
        });
    }
};

module.exports = { registerUser, login };

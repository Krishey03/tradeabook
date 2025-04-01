const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Register User
const registerUser = async (req, res) => {
    console.log("📥 Received body:", req.body);

    const { userName, email, password, phone, address } = req.body;

    try {
        // Check if the user already exists
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User with the same email is already registered" 
            });
        }

        // Validate that all fields are provided
        if (!userName || !email || !password || !phone || !address) {  // Validate all required fields
            return res.status(400).json({
                success: false,
                message: "All fields (userName, email, password, phone, address) are required.",
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
            phone,
            address
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        });
    } catch (e) {
        console.error("❌ Registration Error:", e);
        res.status(500).json({
            success: false,
            message: "An error occurred during registration.",
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user by email
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.status(401).json({
                success: false,
                message: "User does not exist",
            });
        }

        // Compare passwords
        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
        if (!checkPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password does not match",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: checkUser.id, 
                role: checkUser.role, 
                email: checkUser.email, 
                userName: checkUser.userName, 
            },
            'CLIENT_SECRET_KEY', 
            { expiresIn: '60m' }
        );

        // Send response
        return res
            .cookie('token', token, { httpOnly: true, secure: false })
            .json({
                success: true,
                message: "Login successful",
                user: {
                    id: checkUser._id,
                    email: checkUser.email,
                    role: checkUser.role,
                    userName: checkUser.userName,
                    phone: checkUser.phone,
                    address: checkUser.address,
                },
            });

    } catch (e) {
        console.error("❌ Login Error:", e);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login.",
        });
    }
};



// Logout User
const logoutUser = (req, res) => {
    res.clearCookie('token').json({
        success: true,
        message: "Logged out successfully",
    });
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "You are not authenticated!",
        });
    }

    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });
    }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };

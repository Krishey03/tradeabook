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

        // ✅ First, find the user
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.status(401).json({
                success: false,
                message: "User does not exist",
            });
        }

        // ✅ Then, check if user is blocked
        if (checkUser.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Please contact support.",
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
            {
                id: checkUser.id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
                isBlocked: checkUser.isBlocked
            },
            'CLIENT_SECRET_KEY',
            { expiresIn: '60m' }
        );

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
        
        // 🔍 Fetch the user from DB to get latest info like isBlocked
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Your account is banned.",
            });
        }

        req.user = user; // attach full user object if you want later use
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // From authMiddleware
        
        // Return user data (excluding sensitive fields)
        res.status(200).json({
            success: true,
            user: {
                userName: user.userName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });
    } catch (e) {
        console.error("❌ Profile Fetch Error:", e);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching profile.",
        });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const user = req.user; // From authMiddleware
        const { userName, phone, address, currentPassword, newPassword } = req.body;

        // Find the user in DB
        const userToUpdate = await User.findById(user.id);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Update basic info
        if (userName) userToUpdate.userName = userName;
        if (phone) userToUpdate.phone = phone;
        if (address) userToUpdate.address = address;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isPasswordMatch = await bcrypt.compare(currentPassword, userToUpdate.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect.",
                });
            }
            userToUpdate.password = await bcrypt.hash(newPassword, 12);
        }

        await userToUpdate.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                userName: userToUpdate.userName,
                email: userToUpdate.email,
                phone: userToUpdate.phone,
                address: userToUpdate.address,
                role: userToUpdate.role
            }
        });
    } catch (e) {
        console.error("❌ Profile Update Error:", e);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating profile.",
        });
    }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, getUserProfile, updateUserProfile };

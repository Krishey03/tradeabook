const User = require('../../models/User');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // exclude password
        console.log("🧠 Users fetched:", users);
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      user.isBlocked = !user.isBlocked;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
        user,
      });
    } catch (err) {
      console.error("❌ Error toggling block status:", err);
      res.status(500).json({
        success: false,
        message: "Failed to toggle block status.",
      });
    }
  };
module.exports = { getAllUsers, toggleBlockUser };
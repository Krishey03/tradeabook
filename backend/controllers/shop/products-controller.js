const Product = require('../../models/Product')
const { io } = require('../../server');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({
            success: true,
            data: products
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

const getProductDetails = async (req, res) => {
    try {
        // Correctly destructure 'id' from req.params
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product)
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })

        res.status(200).json({
            success: true,
            data: product
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

const placeBid = async (req, res) => {
    try {
        const { productId, bidAmount, bidderEmail } = req.body;
        const io = req.app.get("io");

        // Log the received data
        console.log("Received bid:", { productId, bidAmount, bidderEmail });

        // Validate required fields
        if (!productId || !bidAmount || !bidderEmail) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Ensure bid is higher than the current bid
        if (bidAmount <= product.currentBid) {
            return res.status(400).json({ message: "Bid must be higher than the current bid." });
        }

        // Update product with the new bid
        product.currentBid = bidAmount;
        product.bidderEmail = bidderEmail; // Ensure this field exists in your schema

        // Save changes to the database
        await product.save();

        // Log the product after saving
        console.log("Updated product:", product);

        // Emit the updated bid to all connected clients
        io.emit("newBid", {
            productId: product._id,
            currentBid: product.currentBid,
            bidderEmail: product.bidderEmail // Include in the response
        });

        res.status(200).json({
            message: "Bid placed successfully",
            currentBid: product.currentBid,
            bidderEmail: product.bidderEmail // Return for frontend verification
        });

    } catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ message: "Something went wrong." });
    }
};



module.exports = { getProducts, getProductDetails, placeBid };

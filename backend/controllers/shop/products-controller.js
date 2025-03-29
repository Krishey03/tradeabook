const Product = require('../../models/Product')
const eProduct = require('../../models/Exchange')
const { io } = require('../../server');
const { log } = require('node:console');

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

        console.log("Received bid:", { productId, bidAmount, bidderEmail });

        if (!productId || !bidAmount || !bidderEmail) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // 🚀 **NEW: Check if auction has ended**
        if (new Date() > product.endTime) {
            return res.status(400).json({ message: "Bidding has ended for this product." });
        }

        if (bidAmount <= product.currentBid) {
            return res.status(400).json({ message: "Bid must be higher than the current bid." });
        }

        product.currentBid = bidAmount;
        product.bidderEmail = bidderEmail;

        await product.save();

        console.log("Updated product:", product);

        // Notify all clients via WebSockets
        io.emit("newBid", {
            productId: product._id,
            currentBid: product.currentBid,
            bidderEmail: product.bidderEmail
        });

        res.status(200).json({
            message: "Bid placed successfully",
            currentBid: product.currentBid,
            bidderEmail: product.bidderEmail
        });

    } catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ message: "Something went wrong." });
    }
};

const offerExchange = async (req, res) => {
    try {
        const { productId, userEmail, exchangeOffer } = req.body;

        // Log the incoming data to check if exchangeOffer is coming in correctly
        console.log("Received data:", req.body);

        // Validate required fields
        if (!productId || !userEmail || !exchangeOffer || !exchangeOffer.eTitle || !exchangeOffer.eDescription) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the product by ID to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Create a new eProduct (exchange offer) document
        const newExchangeOffer = new eProduct({
            productId: product._id,  // Link to the original product
            userEmail: userEmail,    // Email of the user offering the exchange
            exchangeOffer: exchangeOffer,  // The offer details
        });

        // Save the exchange offer to the eProduct collection
        await newExchangeOffer.save();

        res.status(200).json({
            message: "Exchange offer submitted successfully!",
            exchangeOffer: newExchangeOffer,
        });
    } catch (error) {
        console.error("Error submitting exchange offer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getSellerExchangeOffers = async (req, res) => {
    try {
        const { sellerEmail } = req.params;
        
        const sellerProducts = await Product.find({ 
            $or: [
                { sellerEmail: sellerEmail },
                { bidderEmail: sellerEmail }
            ]
        });
        
        if (!sellerProducts.length) {
            return res.status(200).json({
                success: true,
                message: "No products found for this seller",
                data: [] 
            });
        }
        
        const productIds = sellerProducts.map(product => product._id);
        
        console.log("Found product IDs:", productIds);
        
        const exchangeOffers = await eProduct.find({
            productId: { $in: productIds }
        }).populate('productId', 'title image'); 
        
        console.log("Found exchange offers:", exchangeOffers); // Add this for debugging
        
        res.status(200).json({
            success: true,
            data: exchangeOffers
        });
        
    } catch (error) {
        console.error("Error fetching exchange offers:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const declineExchangeOffer = async (req, res) => {
    try {
        const { offerId } = req.params;

        // Find the offer by ID
        const offer = await eProduct.findById(offerId);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Exchange offer not found" });
        }

        // Update the offerStatus to "declined"
        offer.offerStatus = "declined";

        // Save the updated offer
        await offer.save();

        res.status(200).json({ success: true, message: "Exchange offer declined successfully" });

    } catch (error) {
        console.error("Error declining exchange offer:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



const getCartItems = async (req, res) => {
    try {
        const { email } = req.params;
        console.log("Fetching cart items for:", email);

        // Find products where the auction has ended, and the user won
        const wonItems = await Product.find({
            bidderEmail: email, 
            // endTime: { $lt: new Date() }
        });

        res.status(200).json({
            success: true,
            data: wonItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching cart items."
        });
    }
};

const acceptExchangeOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        
        // Find the exchange offer by ID
        const exchangeOffer = await eProduct.findById(offerId);
        if (!exchangeOffer) {
            return res.status(404).json({ success: false, message: "Exchange offer not found" });
        }

        // Get the product that the seller has listed for exchange
        const product = await Product.findById(exchangeOffer.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Mark the exchange offer as accepted (You can add other logic here, like updating product status)
        exchangeOffer.status = 'Accepted';
        await exchangeOffer.save();

        // Notify both parties through WebSocket
        io.emit("exchangeOfferAccepted", {
            offerId: exchangeOffer._id,
            productId: exchangeOffer.productId,
            acceptedBy: exchangeOffer.userEmail,
            status: exchangeOffer.status
        });

        res.status(200).json({
            success: true,
            message: "Exchange offer accepted successfully",
            exchangeOffer
        });

    } catch (error) {
        console.error("Error accepting exchange offer:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


module.exports = { getProducts, getProductDetails, placeBid, offerExchange, getSellerExchangeOffers, declineExchangeOffer, getCartItems, acceptExchangeOffer };

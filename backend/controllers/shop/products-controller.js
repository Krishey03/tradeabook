const Product = require('../../models/Product')
const eProduct = require('../../models/Exchange')
const PaymentTransaction = require('../../models/paymentTransaction')
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

//Bidding controller
const placeBid = async (req, res) => {
    try {
        const { productId, bidAmount, bidderEmail } = req.body;
        const io = req.app.get("io");

        console.log("Received bid:", { productId, bidAmount, bidderEmail });

        if (!productId || !bidAmount || !bidderEmail) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check for existing accepted exchange offer
        const existingExchange = await eProduct.findOne({
            productId,
            offerStatus: "accepted"
        });

        if (existingExchange) {
            return res.status(400).json({ 
                message: "Bidding closed - item exchanged" 
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        if (new Date() > product.endTime) {
            return res.status(400).json({ message: "Bidding has ended for this product." });
        }

        if (bidAmount <= product.currentBid) {
            return res.status(400).json({ message: "Bid must be higher than the current bid." });
        }

        product.currentBid = bidAmount;
        product.bidderEmail = bidderEmail;

        await product.save();

        // Single WebSocket emit (removed duplicate)
        io.emit("newBid", {
            productId: product._id,
            currentBid: product.currentBid,
            bidderEmail: product.bidderEmail
        });

        io.emit("productUpdated", { productId: product._id });

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

// const getCartItems = async (req, res) => {
//     try {
//         const { email } = req.params;
//         console.log("Fetching cart items for:", email);

//         // Find products where the auction has ended, and the user won
//         const wonItems = await Product.find({
//             bidderEmail: email, 
//             endTime: { $lt: new Date() }
//         });

//         res.status(200).json({
//             success: true,
//             data: wonItems
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while fetching cart items."
//         });
//     }
// };



// Exchange Offer Controller
const getCartItems = async (req, res) => {
    try {
        const { email } = req.params;
        console.log("Fetching cart items for:", email);

        // Get products that meet basic criteria
        const wonItems = await Product.aggregate([
            {
                $match: {
                    bidderEmail: email,
                    endTime: { $lt: new Date() },
                    paymentStatus: { $nin: ["paid", "refunded"] }
                }
            },
            {
                $lookup: {
                    from: "eproducts",
                    localField: "_id",
                    foreignField: "productId",
                    as: "exchangeOffers"
                }
            },
            {
                $addFields: {
                    hasAcceptedExchange: {
                        $anyElementTrue: {
                            $map: {
                                input: "$exchangeOffers",
                                as: "offer",
                                in: { $eq: ["$$offer.offerStatus", "accepted"] }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    hasAcceptedExchange: false
                }
            }
        ]);

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
        
        // Get all products where the seller is the owner
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
        
        // Get exchange offers for these products that AREN'T from the seller
        const exchangeOffers = await eProduct.find({
            productId: { $in: productIds },
            userEmail: { $ne: sellerEmail } // Exclude offers made by seller
        }).populate('productId', 'title image'); 
        
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

        const offer = await eProduct.findById(offerId);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Exchange offer not found" });
        }

        offer.offerStatus = "declined";

        await offer.save();

        res.status(200).json({ success: true, message: "Exchange offer declined successfully" });

    } catch (error) {
        console.error("Error declining exchange offer:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const acceptExchangeOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        const io = req.app.get("io"); 
        
        const exchangeOffer = await eProduct.findById(offerId);
        if (!exchangeOffer) {
            return res.status(404).json({ success: false, message: "Exchange offer not found" });
        }

        const product = await Product.findById(exchangeOffer.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Prevent acceptance if auction has ended
        if (new Date() > product.endTime) {
            return res.status(400).json({
                success: false,
                message: "Cannot accept offer - auction has ended"
            });
        }

        exchangeOffer.offerStatus = "accepted";
        await exchangeOffer.save();

        // Close the auction and invalidate bids
        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            {
                endTime: new Date(), // Immediately end auction
                currentBid: null,
                bidderEmail: null
            },
            { new: true }
        );

        if (io) {
            io.emit("exchangeOfferAccepted", {
                productId: updatedProduct._id,
                endTime: updatedProduct.endTime,
                currentBid: null,
                bidderEmail: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Exchange offer accepted successfully",
            exchangeOffer,
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error accepting exchange offer:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getUserExchangeOffers = async (req, res) => {
    try {
        const { userEmail } = req.params; 

        // Modified query to filter out paid exchanges and only show accepted ones
        const userOffers = await eProduct.find({ 
            userEmail,
            offerStatus: "accepted",  // Only accepted offers
            paymentStatus: { $ne: "paid" }  // Exclude paid exchanges
        })
        .populate('productId', 'title image') 
        .exec();

        if (!userOffers || userOffers.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No exchange offers found for this user",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            data: userOffers 
        });
    } catch (error) {
        console.error("Error fetching user exchange offers:", error); 
        res.status(500).json({
            success: false,
            message: 'Server Error' 
        });
    }
};

const getUserOrders = async (req, res) => {
    try {
      const { userEmail } = req.params;
      console.log(`[1/5] Starting order fetch for: ${userEmail}`);
  
      // 1. Get all completed payments
      const payments = await PaymentTransaction.find({ status: 'completed' }).lean();
      console.log(`[2/5] Found ${payments.length} completed payments`);
  
      // 2. Extract product IDs and types
      const productDetails = payments.map(p => ({
        id: p.productId,
        type: p.productModel
      }));
      console.log('[3/5] Product details:', productDetails);
  
      // 3. Fetch products in parallel
      const [products, eProducts] = await Promise.all([
        Product.find({ _id: { $in: productDetails.filter(p => p.type === 'Product').map(p => p.id) } }).lean(),
        eProduct.find({ _id: { $in: productDetails.filter(p => p.type === 'eProduct').map(p => p.id) } }).lean()
      ]);
      console.log(`[4/5] Found ${products.length} products and ${eProducts.length} eProducts`);
  
      // 4. Filter and format orders
      const allProducts = [...products, ...eProducts];
      const userOrders = payments.filter(payment => {
        const product = allProducts.find(p => p._id.equals(payment.productId));
        return product && (
          product.bidderEmail === userEmail ||
          product.winnerEmail === userEmail ||
          product.userEmail === userEmail
        );
      });
      console.log(`[5/5] Found ${userOrders.length} orders for user`);
  
      res.status(200).json({
        success: true,
        data: userOrders.map(order => ({
          paymentId: order._id,
          amount: order.amount,
          status: order.status,
          product: allProducts.find(p => p._id.equals(order.productId)),
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod
        }))
      });
  
    } catch (error) {
      console.error('Controller Error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
  };


module.exports = { getProducts, getProductDetails, placeBid, offerExchange, getSellerExchangeOffers, getUserOrders, declineExchangeOffer, getCartItems, acceptExchangeOffer, getUserExchangeOffers };

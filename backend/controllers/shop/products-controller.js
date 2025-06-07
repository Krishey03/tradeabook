const Product = require('../../models/Product')
const eProduct = require('../../models/Exchange')
const PaymentTransaction = require('../../models/paymentTransaction')
const { io } = require('../../server');
const { log } = require('node:console');
const { differenceInDays } = require('date-fns');

const isValidImageUrl = (url) => {
    const cloudinaryRegex = /^https?:\/\/res\.cloudinary\.com\/.+\/.+\.(jpg|jpeg|png|gif|webp)$/;
    return cloudinaryRegex.test(url);
};

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
        const { productId } = req.params;  // Now getting from URL params
        const { bidAmount, bidderEmail } = req.body;
        const io = req.app.get('io');

        if (!bidAmount || !bidderEmail) {
            return res.status(400).json({ message: "Bid amount and email are required." });
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

        if (bidAmount <= product.minBid) {
        return res.status(400).json({ 
            message: `Bid must be higher than minimum bid (Rs. ${product.minBid})` 
        });
        }

        product.currentBid = bidAmount;
        product.bidderEmail = bidderEmail;

        await product.save();

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
        res.status(500).json({ 
            message: error.message || "Failed to place bid" 
        });
    }
};

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

        const requiredFields = [
            'eTitle', 'eImage', 'eAuthor', 'eIsbn',
            'ePublisher', 'ePublicationDate', 'eEdition',
            'eDescription', 'eBuyerPhone'
        ];
        
        const missingFields = requiredFields.filter(field => !exchangeOffer?.[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const isValidImageUrl = (url) => {
            const cloudinaryRegex = /^https?:\/\/res\.cloudinary\.com\/.+\/.+\.(jpg|jpeg|png|gif|webp)$/;
            return cloudinaryRegex.test(url);
        };

        if (!isValidImageUrl(exchangeOffer.eImage)) {
            return res.status(400).json({
                success: false,
                message: "Invalid image URL format (must be a valid Cloudinary URL)"
            });
        }

        if (!/^\d{10}$/.test(exchangeOffer.eBuyerPhone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format (must be 10 digits)"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const newExchangeOffer = new eProduct({
        productId: product._id,
        userEmail,
        exchangeOffer: {
            ...exchangeOffer,
            eBuyerPhone: Number(exchangeOffer.eBuyerPhone)
        }
        });

        // Validate against schema before saving
        const validationError = newExchangeOffer.validateSync();
        if (validationError) {
            const errors = Object.values(validationError.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        await newExchangeOffer.save();

        // Update product with exchange offer reference
        await Product.findByIdAndUpdate(productId, {
            $push: { exchangeOffers: newExchangeOffer._id }
        });

        res.status(201).json({
            success: true,
            message: "Exchange offer submitted successfully!",
            offer: newExchangeOffer
        });

    } catch (error) {
        console.error("Exchange error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Internal server error during exchange submission"
        });
    }
};

const isOfferExpired = (endTime) => {
  if (!endTime) return false;
  const expirationDate = new Date(endTime);
  expirationDate.setDate(expirationDate.getDate() + 2);
  return new Date() > expirationDate;
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
        
        // Get exchange offers for these products that are not from the seller
        const exchangeOffers = await eProduct.find({
            productId: { $in: productIds },
            userEmail: { $ne: sellerEmail } // Exclude offers made by seller
        }).populate('productId', 'title image'); 

        // Filter out expired offers (2 days after auction end)
        const filteredOffers = exchangeOffers.filter(offer => {
        return !isOfferExpired(offer.productId?.endTime);
        });
        
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

        const userOffers = await eProduct.find({ 
            userEmail,
            offerStatus: "accepted",
            paymentStatus: { $ne: "paid" }
        })
        .populate({
            path: 'productId',
            select: 'title image sellerEmail sellerPhone',
            model: 'Product',
            populate: {
                path: 'seller',
                select: 'phone'
            }
            })
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
  
      // Fetch completed payments
      const payments = await PaymentTransaction.find({ status: 'completed' }).lean();
      const productDetails = payments.map(p => ({
        id: p.productId,
        type: p.productModel
      }));
  
      // Fetch products and eProducts with necessary population
      const [products, eProducts] = await Promise.all([
        Product.find({ _id: { $in: productDetails.filter(p => p.type === 'Product').map(p => p.id) } }).lean(),
        eProduct.find({ _id: { $in: productDetails.filter(p => p.type === 'eProduct').map(p => p.id) } })
          .populate('productId', 'title image') // Populate productId with title and image
          .lean()
      ]);
  
      const allProducts = [...products, ...eProducts];
  
      // Filter user's orders and include productType
      const userOrders = payments.filter(payment => {
        const product = allProducts.find(p => p._id.equals(payment.productId));
        return product && (
          product.bidderEmail === userEmail ||
          product.winnerEmail === userEmail ||
          product.userEmail === userEmail
        );
      });
  
      res.status(200).json({
        success: true,
        data: userOrders.map(payment => ({
          paymentId: payment._id,
          amount: payment.amount,
          status: payment.status,
          product: allProducts.find(p => p._id.equals(payment.productId)),
          productType: payment.productModel, // Include productType
          createdAt: payment.createdAt,
          paymentMethod: payment.paymentMethod
        }))
      });
  
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
  };


module.exports = { 
    getProducts, 
    getProductDetails, 
    placeBid, 
    offerExchange, 
    getSellerExchangeOffers, 
    getUserOrders, 
    declineExchangeOffer, 
    getCartItems, 
    acceptExchangeOffer, 
    getUserExchangeOffers, 
    isOfferExpired 
};

const express = require('express')
const { 
  getProducts, 
  getProductDetails, 
  placeBid, 
  offerExchange,
  getSellerExchangeOffers,
  declineExchangeOffer ,
  getCartItems,
  acceptExchangeOffer,
  getUserExchangeOffers,
  getUserOrders
} = require('../../controllers/shop/products-controller')

const { upload } = require("../../helpers/cloudinary");

const router = express.Router()

router.get('/get', getProducts)
router.get('/get/:id', getProductDetails)
router.post("/placeBid", placeBid)
router.post("/offerExchange", offerExchange)
router.get("/exchangeOffers/:sellerEmail", getSellerExchangeOffers)
router.patch("/exchangeOffers/:offerId", declineExchangeOffer)
router.put('/exchangeOffers/accept/:offerId', acceptExchangeOffer);
router.get("/cart/:email", getCartItems)
router.get("/exchangeOffers/user/:userEmail", getUserExchangeOffers);
router.get('/:userEmail', getUserOrders);

module.exports = router
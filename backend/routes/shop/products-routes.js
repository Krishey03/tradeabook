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

router.get("/cart/:email", getCartItems)
router.get("/exchangeOffers/:sellerEmail", getSellerExchangeOffers)
router.get("/exchangeOffers/user/:userEmail", getUserExchangeOffers)

router.get('/orders/:userEmail', getUserOrders);
router.post('/:productId/placeBid', placeBid);
router.post("/offerExchange", offerExchange)
router.patch("/exchangeOffers/:offerId", declineExchangeOffer)
router.put('/exchangeOffers/accept/:offerId', acceptExchangeOffer)

module.exports = router
const express = require('express')
const { 
  getProducts, 
  getProductDetails, 
  placeBid, 
  offerExchange,
  getSellerExchangeOffers  // Add this import
} = require('../../controllers/shop/products-controller')

const { upload } = require("../../helpers/cloudinary");

const router = express.Router()

router.get('/get', getProducts)
router.get('/get/:id', getProductDetails)
router.post("/placeBid", placeBid)
router.post("/offerExchange", offerExchange)
router.get("/exchangeOffers/:sellerEmail", getSellerExchangeOffers)  // Add this new route

module.exports = router
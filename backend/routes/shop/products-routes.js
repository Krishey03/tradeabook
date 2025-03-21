const express = require('express')
const { 
  getProducts, 
  getProductDetails, 
  placeBid, 
  offerExchange,
  getSellerExchangeOffers,
  deleteExchangeOffer 
} = require('../../controllers/shop/products-controller')

const { upload } = require("../../helpers/cloudinary");

const router = express.Router()

router.get('/get', getProducts)
router.get('/get/:id', getProductDetails)
router.post("/placeBid", placeBid)
router.post("/offerExchange", offerExchange)
router.get("/exchangeOffers/:sellerEmail", getSellerExchangeOffers)
router.delete("/exchangeOffers/:offerId", deleteExchangeOffer);  

module.exports = router
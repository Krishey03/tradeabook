

const express = require('express')
const{ getProducts, getProductDetails, placeBid  } = require('../../controllers/shop/products-controller')

const { upload } = require("../../helpers/cloudinary");

const router = express.Router()

router.get('/get', getProducts)
router.get('/get/:id', getProductDetails)
router.post("/placeBid", placeBid);

module.exports = router
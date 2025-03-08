

const express = require('express')
const{ getProducts, getProductDetails } = require('../../controllers/shop/products-controller')

const { upload } = require("../../helpers/cloudinary");

const router = express.Router()

router.get('/get', getProducts)
router.get('/get/:id', getProductDetails)

module.exports = router
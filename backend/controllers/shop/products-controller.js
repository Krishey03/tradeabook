const Product = require('../../models/Product')


const getProducts = async (req, res) => {
    try{
        const products = await Product.find({})
        res.status(200).json({
            success: true,
            data: products
        })
    }catch(e){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

module.exports = {getProducts}
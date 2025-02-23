const { imageUploadUtil } = require("../../helpers/cloudinary")
const Product = require("../../models/Product")




const handleImageUpload = async(req, res)=>{
    try{
        const b64 = Buffer.from(req.file.buffer).toString('base64')
        const url = "data:" + req.file.mimetype + ";base64," + b64
        const result = await imageUploadUtil(url)
        res.json({
            success: true,
            result
        })
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: "An error occurred."
        })
    }
}

//add a new product
const addProduct = async(req,res)=>{
    try{
        const{title, author, category, description, image, seller, minBid} = req.body
        const newlyCreatedProduct = new Product({
            title, author, category, description, image, seller, minBid
        })
        await newlyCreatedProduct.save()
        res.status(201).json({
            success: True,
            data: newlyCreatedProduct
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "An error occured!"
        })
    }
}

//fetch all products
const fetchAllProducts = async(req,res)=>{
    try{
        const listOfProducts = await Product.find({})
        res.status(200).json({
            success: True,
            data: listOfProducts
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "An error occured!"
        })
    }
}

//edit a product
const editProduct = async(req,res)=>{
    try{
        const {id} = req.params
        const{title, author, category, description, image, seller, minBid} = req.body
        const findProduct = await Product.findById(id)
        if(!findProduct) return res.status(404).json({
            success:false,
            message:"Product not found.",
        })
        findProduct.title = title || findProduct.title
        findProduct.author = author || findProduct.author
        findProduct.category = category || findProduct.category
        findProduct.description = description || findProduct.description
        findProduct.image = image || findProduct.image
        findProduct.seller = seller || findProduct.seller
        findProduct.minBid = minBid || findProduct.minBid

        await findProduct.save()
        res.status(200).json({
            success: true,
            data: findProduct, 
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "An error occured!"
        })
    }
}

//delete a product
const deleteProduct = async(req,res)=>{
    try{
        const{id} = req.params
        const product = await Product.findByIdAndUpdate(id)
        if(!findProduct) return res.status(404).json({
            success:false,
            message:"Product not found.",
        })

        res.status(200).json({
            success: true,
            message: "Product has been deleted!"
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            success: false,
            message: "An error occured!"
        })
    }
}

module.exports = {handleImageUpload, addProduct, editProduct, deleteProduct, fetchAllProducts}
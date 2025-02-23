const cloudinary = require('cloudinary').v2
const multer = require('multer')

cloudinary.config({
    cloud_name: 'dzadndcar',
    api_key: '232377235531449',
    api_secret: 'gWXqN1wrpry6Fkld1M2TwZslZuU'
})

const storage = new multer.memoryStorage()

async function imageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto"
    })

    return result
}

const upload = multer({storage})

module.exports = {
    upload,
    imageUploadUtil
}
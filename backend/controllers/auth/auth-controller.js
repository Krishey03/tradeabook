const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

//register

const registerUser = async(req, res) => {
    const{userName, email, password} = req.body

    try{
        const hashPassword = await bycrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashPassword
        })

        await newUser.save()
        res.status(200).json({
            success: true,
            message: "User registered successfully!"
        })
    }

    catch(e){
        console.log(e);
        req.status(500).json({
            success: false,
            message: "An error occurred"
        })
    }
}

//Login
const login = async(req, res) => {
    const{userName, email, password} = req.body

    try{

    }

    catch(e){
        console.log(e);
        req.status(500).json({
            success: false,
            message: "An error occurred"
        })
    }
}





module.exports = {registerUser}
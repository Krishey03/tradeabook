const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true,
        // match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"], 
    },

    address: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default : 'user'
    }

})

const User = mongoose.model('User', UserSchema);
module.exports = User;
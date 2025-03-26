const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String
    },
    phonenumber: { 
        type: String,
        required: true,
        unique: true
    },
    isVerified: {
         type: Boolean,
          default: false 
    },
    name: {
         type: String,
         required: true,
    },
    role: {
        type: String,
        enum: ["farmer", "trader"],
        default: "farmer",
    },
    location: {
        type: String,
        required: true,
        max: 500,
    },
    token: {
        type: String
    },
    
}, { timestamps: true } );

const User = mongoose.model('user', userSchema);

module.exports = User;


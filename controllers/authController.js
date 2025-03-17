const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const otpStore = {}; // Temporary store for OTPs


// function for login the user
async function handleUserLogin(req, res) {
    const { phonenumber } = req.body;
    if (!phonenumber) {
       return res.status(400).json({status: "error", message: "Please enter Phone number"});
    }

    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phonenumber] = otp;


    return res.status(200).json({
        status: true,
        Number: phonenumber,
        OTP: otp,
        message: "Otp Send successfully"});
};

// /function for verify the OTP
async function handleOtpVerification(req, res) {
    const { phonenumber, otp } = req.body;

    if (!phonenumber || !otp) {
        return res.status(400).json({ status: "error", message: "Phone number and OTP are required" });
    }

    const storedOtp = otpStore[phonenumber];

    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    // OTP verified, delete from store
    delete otpStore[phonenumber];

    let user = await User.findOne({ phonenumber });

    if (!user) {
        return res.status(400).json({
            status: "error",
            register: false,
            message: "OTP verified! Please registered first"
        });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    try {
        user.token = token;
        await user.save();

        return res.status(200).json({
            status: true,
            register: true,
            message: "OTP Verified",
            userID: user.id,
            token: token
        });
    } catch (error) {
        console.error('Error updating user token:', error);
        return res.status(500).json({ status: "error", message: "Server error" });
    }
}

// function for New User Registeration
async function handleUserRegister(req, res) {
    const { phonenumber, name, role, location} = req.body;

    if(!phonenumber || !name || !role ||!location) {
        return res.status(400).json({ message: "Please enter full details"});
    };

    let user = await User.findOne({phonenumber});

    if(user) {
        return res.status(400).json({status: "error", message: "phonenumber already exists"});
    }

    user = new User({ phonenumber, name, role, location, isVerified: true });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    try{
        await user.save();
        return res.status(200).json({
            status: true,
            token: token,
            message: "Registration successful.",
        });
    } catch(error) {
        return res.status(500).json({ status: "error", message: "Server error" });
    }
};


module.exports = {
    handleUserLogin,
    handleOtpVerification,
    handleUserRegister,
}
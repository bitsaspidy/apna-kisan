const User = require('../models/user');
const jwt = require('jsonwebtoken');
import dbConnect from '../lib/mongodb';
const Otp = require("../models/otp");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Handle User Login - Sends OTP
 */
async function handleUserLogin(req, res) {
    await dbConnect(); // Ensure DB connection before any DB operation
    const { phonenumber } = req.body;

    if (!phonenumber) {
        return res.status(400).json({
            status: false,
            message: "Please enter Phone number",
            response: null
        });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be exactly 10 digits.",
            response: null
        });
    }

    try {
        const otp = Math.floor(10000 + Math.random() * 90000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await Otp.deleteMany({ phonenumber });

        await Otp.create({ phonenumber, otp, expiresAt });
        console.log(`Generated OTP for ${phonenumber}: ${otp}`);

        return res.status(200).json({
            status: true,
            message: "OTP has been sent successfully.",
            response: {
            phonenumber: phonenumber,
            otp: otp
            }
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        return res.status(500).json({
            status: false,
            message: "Server error while generating OTP",
            response: null
        });
    }
}

/**
 * Handle OTP Verification and Login
 */
async function handleOtpVerification(req, res) {
    await dbConnect(); // Ensure DB connection before any DB operation
    const { phonenumber, otp } = req.body;

    if (!phonenumber || !otp) {
        return res.status(400).json({
            status: false,
            message: "Phone number and OTP are required",
            response: null
        });
    }

    try {
        const otpRecord = await Otp.findOne({ phonenumber, otp });

        // const storedOtp = otpStore[phonenumber];

        if (!otpRecord) {
            return res.status(400).json({
                status: false,
                message: "Invalid OTP",
                response: null,
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            // OTP expired
            await Otp.deleteOne({ _id: otpRecord._id }); // optional: clean up
            return res.status(400).json({
              status: false,
              message: "OTP has expired",
              response: null
            });
          }
          await Otp.deleteOne({ _id: otpRecord._id });


        console.time('MongoFindOne');
        let user = await User.findOne({ phonenumber });
        console.timeEnd('MongoFindOne');

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "OTP verified! Please register first",
                response: {
                    userId: "",
                    token: "",
                }
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET);

        user.token = token;
        await user.save();

        return res.status(200).json({
            status: true,
            message: "OTP Verified. Login successful.",
            response: {
                userId: user._id,
                phonenumber: user.phonenumber,
                name: user.name,
                location: user.location,
                role: user.role,
                token: token
            }
        });

    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({
            status: false,
            message: "Server error during OTP verification",
            response: {
                userId: '',
                token: ''
            }
        });
    }
}

/**
 * Handle User Registration
 */
async function handleUserRegister(req, res) {
    await dbConnect(); // Ensure DB connection before any DB operation
    const { phonenumber, name, role, location } = req.body;

    if (!phonenumber || !name || !role || !location) {
        return res.status(400).json({
            status: false,
            message: "Please enter full details",
            response: null
        });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be exactly 10 digits.",
            response: null
        });
    }

    try {
        console.time('MongoFindUser');
        let user = await User.findOne({ phonenumber });
        console.timeEnd('MongoFindUser');

        if (user) {
            return res.status(400).json({
                status: false,
                message: "Phone number already exists",
                response: null
            });
        }

        user = new User({
            phonenumber,
            name,
            role,
            location,
            isVerified: true
        });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);

        user.token = token;

        await user.save();

        return res.status(200).json({
            status: true,
            message: "Registration successful.",
            response: {
                userId: user._id,
                phonenumber: user.phonenumber,
                name: user.name,
                location: user.location,
                role: user.role,
                token: token,
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
            status: false,
            message: "Server error during registration",
            response: {
                userId: '',
                token: ''
            }
        });
    }
};

async function handleEditProfile(req, res) {
    await dbConnect();
    const { name, phonenumber, location } = req.body;

    if (!name && !phonenumber && !location) {
        return res.status(400).json({ status: "error", message: "Please provide data to update" });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        if (name) user.name = name;
        if (phonenumber) user.phonenumber = phonenumber;
        if (location) user.location = location;

        await user.save();

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            response: {
                id: user._id,
                name: user.name,
                phonenumber: user.phonenumber,
                location: user.location
            }
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Error updating profile",
            response: null
        });
    }
};

module.exports = {
    handleUserLogin,
    handleOtpVerification,
    handleUserRegister,
    handleEditProfile
};

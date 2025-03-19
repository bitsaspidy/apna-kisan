const User = require('../models/user');
const jwt = require('jsonwebtoken');
import dbConnect from '../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
// const otpStore = {}; // In-memory OTP storage (temporary, better to use Redis for production)

/**
 * Handle User Login - Sends OTP
 */
async function handleUserLogin(req, res) {
    await dbConnect(); // Ensure DB connection before any DB operation
    const { phonenumber } = req.body;

    if (!phonenumber) {
        return res.status(400).json({
            status: "error",
            message: "Please enter Phone number"
        });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be exactly 10 digits."
        });
    }

    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.deleteMany({ phonenumber });

        await Otp.create({ phonenumber, otp, expiresAt });

        // Store OTP in memory (Consider using Redis for production)
        // otpStore[phonenumber] = otp;

        console.log(`Generated OTP for ${phonenumber}: ${otp}`);

        return res.status(200).json({
            status: true,
            phonenumber: phonenumber,
            otp: otp,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        return res.status(500).json({
            status: "error",
            message: "Server error while generating OTP"
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
            status: "error",
            message: "Phone number and OTP are required"
        });
    }

    try {
        const otpRecord = await Otp.findOne({ phonenumber, otp });

        // const storedOtp = otpStore[phonenumber];

        if (!otpRecord || otpRecord !== otp) {
            return res.status(400).json({
                status: "error",
                message: "Invalid OTP"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            // OTP expired
            await Otp.deleteOne({ _id: otpRecord._id }); // optional: clean up
            return res.status(400).json({
              status: "error",
              message: "OTP has expired"
            });
          }
          await Otp.deleteOne({ _id: otpRecord._id });

        // // OTP verified - delete it from the store
        // delete otpStore[phonenumber];

        console.time('MongoFindOne');
        let user = await User.findOne({ phonenumber });
        console.timeEnd('MongoFindOne');

        if (!user) {
            return res.status(400).json({
                status: "error",
                register: false,
                message: "OTP verified! Please register first"
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        user.token = token;
        await user.save();

        return res.status(200).json({
            status: true,
            register: true,
            message: "OTP Verified. Login successful.",
            userID: user._id,
            token: token
        });

    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({
            status: "error",
            message: "Server error during OTP verification"
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
            message: "Please enter full details"
        });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be exactly 10 digits."
        });
    }

    try {
        console.time('MongoFindUser');
        let user = await User.findOne({ phonenumber });
        console.timeEnd('MongoFindUser');

        if (user) {
            return res.status(400).json({
                status: "error",
                message: "Phone number already exists"
            });
        }

        user = new User({
            phonenumber,
            name,
            role,
            location,
            isVerified: true
        });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        user.token = token;

        await user.save();

        return res.status(200).json({
            status: true,
            token: token,
            message: "Registration successful."
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
            status: "error",
            message: "Server error during registration"
        });
    }
};

async function handleEditProfile(req, res) {
    const { fullname, phonenumber, location } = req.body;

    if (!fullname && !phonenumber && !location) {
        return res.status(400).json({ status: "error", message: "Please provide data to update" });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        if (fullname) user.name = fullname;
        if (phonenumber) user.phonenumber = phonenumber;
        if (location) user.location = location;

        await user.save();

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullname: user.name,
                phonenumber: user.phonenumber,
                location: user.location
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Error updating profile",
            error: err.message
        });
    }
};

module.exports = {
    handleUserLogin,
    handleOtpVerification,
    handleUserRegister,
    handleEditProfile
};

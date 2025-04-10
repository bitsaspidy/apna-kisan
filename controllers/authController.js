const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Otp = require("../models/otp");
const JWT_SECRET = process.env.JWT_SECRET;
const moment = require('moment');

const otpStore = {}; // Temporary store for OTPs


// function for login the user
async function handleUserLogin(req, res) {
    const { phonenumber } = req.body;
    if (!phonenumber) {
       return res.status(200).json({
            status: false,
            message: "Please enter Phone number",
            response: null
        });
    }
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        return res.status(200).json({
            status: false,
            message: "Phone number must be exactly 10 digits.",
            response: null
        });
    }

    // Generate a 6-digit random OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 min

    // Remove any existing OTPs for this phone number
    await Otp.deleteMany({ phonenumber });

    // Save new OTP
    await Otp.create({ phonenumber, otp, expiresAt });


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
};

// /function for verify the OTP
async function handleOtpVerification(req, res) {
    const { phonenumber, otp } = req.body;

    if (!phonenumber || !otp) {
        return res.status(200).json({ 
            status: false,
            message: "Phone number and OTP are required",
            response: {
                userId: '',
                token: ''
            }
         });
    }

    try {
        const otpRecord = await Otp.findOne({ phonenumber, otp });

        // const storedOtp = otpStore[phonenumber];

        if (!otpRecord) {
            return res.status(200).json({
                status: false,
                message: "Invalid OTP",
                response: {
                    userId: '',
                    token: ''
                }
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            // OTP expired
            await Otp.deleteOne({ _id: otpRecord._id }); // optional: clean up
            return res.status(200).json({
              status: false,
              message: "OTP has expired",
              response: {
                userId: '',
                token: ''
            }
            });
          }
          await Otp.deleteOne({ _id: otpRecord._id });

        let user = await User.findOne({ phonenumber });

        if (!user) {
            return res.status(200).json({
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
        return res.status(200).json({
            status: false,
            message: "Server error during OTP verification",
            response: {
                userId: '',
                token: ''
            }
        });
    }
}

// function for New User Registeration
async function handleUserRegister(req, res) {
    console.log("Registering user:", req.body);
    let { phonenumber, name, role, location} = req.body;

    if(!phonenumber || !name || !role ||!location) {
        console.log("Missing details for registration")
        return res.status(200).json({ 
            status: false,
            message: "Please enter full details",
            response: {
                userId: '',
                token: ''
            }
         });
    };

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phonenumber)) {
        console.log("Invalid phone number")
        return res.status(200).json({
            status: false,
            message: "Phone number must be exactly 10 digits.",
            response: {
                userId: '',
                token: ''
            }
        });
    }

    try {
        console.time('MongoFindUser');
        let user = await User.findOne({ phonenumber });
        console.timeEnd('MongoFindUser');

        role = role.toLowerCase();
        if (user) {
            console.log("Phone number already exists")
            return res.status(200).json({
                status: false,
                message: "Phone number already exists",
                response: {
                    userId: '',
                    token: ''
                }
            });
        }

        role = role.toLowerCase();

        user = new User({
            phonenumber,
            name,
            role,
            location,
            isVerified: true
        });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);

        user.token = token;
        console.log("User created:", user);
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
    const { fullname, location } = req.body;

    if (!fullname  && !location) {
        return res.status(200).json({ status: false, message: "Please provide data to update" , response: null});
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(200).json({ status: false, message: "User not found", response: null });
        }

        if (fullname) user.name = fullname;
        if (location) user.location = location;

        const userlist = {
            userId: user._id,
            fullname: user.name,
            phonenumber: user.phonenumber,
            location: user.location,
            role: user.role,
            createdAt:  moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(user.updatedAt).format('YYYY-MM-DD HH:mm:ss')

        }

        await user.save();

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            response: userlist
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Error updating profile",
            error: err.message
        });
    }
};

async function handleGetUserProfile(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(200).json({
                status: false,
                message: "User ID not found in request",
                response: null
            });
        }

        const user = await User.findById(userId).select('-__v -token');

        if (!user) {
            return res.status(200).json({
                status: false,
                message: "User not found",
                response: null
            });
        }

        return res.status(200).json({
            status: true,
            message: "User profile fetched successfully",
            response: {
                userId: user._id,
                phonenumber: user.phonenumber,
                name: user.name,
                location: user.location,
                role: user.role,
                createdAt:  moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt:  moment(user.updatedAt).format('YYYY-MM-DD HH:mm:ss')
            }
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            status: false,
            message: "Server error while fetching user profile",
            response: null
        });
    }
}




module.exports = {
    handleUserLogin,
    handleOtpVerification,
    handleUserRegister,
    handleEditProfile,
    handleGetUserProfile,
}
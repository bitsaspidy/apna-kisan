const express = require('express');
const {handleUserLogin, handleOtpVerification, handleUserRegister, handleEditProfile, handleGetUserProfile} = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");
const translateMiddleware = require('../middleware/translateMiddleware');

const router = express.Router();

router.post('/login', handleUserLogin);
router.post('/verifyotp', handleOtpVerification);
router.post('/register', handleUserRegister);
router.put('/edit-profile', authMiddleware, handleEditProfile);
router.get('/profile', translateMiddleware, authMiddleware, handleGetUserProfile);


module.exports = router;
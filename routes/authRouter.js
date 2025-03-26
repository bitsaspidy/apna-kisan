const express = require('express');
const {handleUserLogin, handleOtpVerification, handleUserRegister, handleEditProfile} = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");
const translateMiddleware = require('../middleware/translateMiddleware');

const router = express.Router();

router.post('/login', handleUserLogin);
router.post('/verifyotp', handleOtpVerification);
router.post('/register', handleUserRegister);
router.put('/edit-profile', translateMiddleware, authMiddleware, handleEditProfile);


module.exports = router;
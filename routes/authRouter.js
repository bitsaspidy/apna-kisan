const express = require('express');
const {handleUserLogin, handleOtpVerification, handleUserRegister} = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/login', handleUserLogin);
router.post('/verifyotp', handleOtpVerification);
router.post('/register', handleUserRegister);
router.put('/edit-profile', authMiddleware, handleEditProfile);


module.exports = router;
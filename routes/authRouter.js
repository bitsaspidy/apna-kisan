const express = require('express');
const {handleUserLogin, handleOtpVerification, handleUserRegister} = require('../controllers/authController');

const router = express.Router();

router.post('/login', handleUserLogin);
router.post('/verifyotp', handleOtpVerification);
router.post('/register', handleUserRegister);


module.exports = router;
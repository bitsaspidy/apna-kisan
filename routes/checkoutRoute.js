const express = require('express');
const router = express.Router();
const {handleCheckout } = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/confirm', authMiddleware, handleCheckout);

module.exports = router;
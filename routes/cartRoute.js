const express = require('express');
const router = express.Router();
const {addToCart, viewCart, updateCartQuantity, removeCartItem, emptyUserCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addToCart);
router.get('/view', authMiddleware, viewCart);
router.put('/update', authMiddleware, updateCartQuantity);
router.delete('/delete/:productID', authMiddleware, removeCartItem);
router.delete('/empty', authMiddleware, emptyUserCart);

module.exports = router;
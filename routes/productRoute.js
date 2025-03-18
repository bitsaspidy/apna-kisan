const express = require('express');
const router = express.Router();
const {handleGetUserProducts, handleAddNewProduct, handleGetAllProducts, handleGetProductByCategory, handleUpdateProduct, handleDeleteProduct, handleUpdateProductImages} = require('../controllers/productController');
const upload = require('../multer/multerconfig');
const authmiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');

// Product Routes
router.post('/add', authmiddleware, upload.array('images', 5), handleAddNewProduct);
router.get('/all-products', authmiddleware, translateMiddleware, handleGetAllProducts);
router.get('/category/:category',authmiddleware, translateMiddleware, handleGetProductByCategory);
router.get('/my-products', authmiddleware, translateMiddleware, handleGetUserProducts);
router.put('/update/:productId',authmiddleware, upload.array('images', 5), handleUpdateProduct);
router.delete('/delete/:productId',authmiddleware, handleDeleteProduct)

module.exports = router;
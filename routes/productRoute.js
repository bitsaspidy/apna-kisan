const express = require('express');
const router = express.Router();
const {handleGetUserProducts, handleAddNewProduct, handleGetAllProducts, handleGetProductByCategory, handleUpdateProduct, handleDeleteProduct, handleUpdateProductImages} = require('../controllers/productController');
const upload = require('../multer/multerconfig');
const authmiddleware = require('../middleware/authMiddleware');

// Product Routes
router.post('/add', authmiddleware, upload.array('images', 5), handleAddNewProduct);
router.get('/all-products', handleGetAllProducts);
router.get('/category/:category', handleGetProductByCategory);
router.get('/my-products', authmiddleware, handleGetUserProducts);
router.put('/update/:productId',authmiddleware, upload.array('images', 5), handleUpdateProduct);
router.delete('/delete/:productId',authmiddleware, handleDeleteProduct)

module.exports = router;
const express = require('express');
const router = express.Router();
const {searchProduct, handleGetUserProducts, handleAddNewProduct, handleGetAllProducts, handleGetProductByCategory, handleUpdateProduct, handleDeleteProduct, handleUpdateProductImages} = require('../controllers/productController');
const upload = require('../multer/multerconfig');
const authmiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');
const {handleAddNewProductCategory, handleGetAllCategory, handleDeleteProductCategory, handleUpdateProductCategory} = require('../controllers/productCategoryController');

// Product Routes
router.post('/add', authmiddleware, upload.array('images', 5), handleAddNewProduct);
router.get('/all-products', authmiddleware, translateMiddleware, handleGetAllProducts);
router.get('/category/:categoryName',authmiddleware, translateMiddleware, handleGetProductByCategory);
router.get('/my-products', authmiddleware, translateMiddleware, handleGetUserProducts);
router.put('/update/:productId',authmiddleware, upload.array('images', 5), handleUpdateProduct);
router.delete('/delete/:productId',authmiddleware, handleDeleteProduct);
router.get('/search', authmiddleware, translateMiddleware, searchProduct);

// Category Routes
router.post('/category/add', handleAddNewProductCategory);
router.get('/all-category', handleGetAllCategory);
router.put('/category/update/:categoryId', handleUpdateProductCategory);
router.delete('/category/delete/:categoryId', handleDeleteProductCategory);


module.exports = router;
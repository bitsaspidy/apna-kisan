const express = require('express');
const router = express.Router();
const { handleGetUserProducts, handleAddNewProduct, handleGetAllProducts, handleGetProductByCategory, handleUpdateProduct, handleDeleteProduct, handleUpdateProductImages} = require('../controllers/productController');
const upload = require('../multer/multerconfig');
const authmiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');
const {handleAddNewProductCategory, handleGetAllCategory, handleDeleteProductCategory, handleUpdateProductCategory} = require('../controllers/productCategoryController');
const {searchProduct} = require('../controllers/searchController');

// Product Routes
// router.post('/add', authmiddleware, upload.array('images', 10), handleAddNewProduct);
router.post('/add', authmiddleware, upload.any(), handleAddNewProduct);
router.get('/all-products', authmiddleware, translateMiddleware, handleGetAllProducts);
router.post('/productlist', authmiddleware, translateMiddleware, handleGetProductByCategory);
router.get('/my-products', authmiddleware, translateMiddleware, handleGetUserProducts);
router.put('/update/:productId',authmiddleware, upload.any(), handleUpdateProduct);
// router.put('/update/:productId',authmiddleware, upload.array('images', 5), handleUpdateProduct);
router.delete('/delete/:productId',authmiddleware, handleDeleteProduct);

// Search Routes
router.get('/search ', authmiddleware, translateMiddleware, searchProduct);

// Category Routes
router.post('/category/add', authmiddleware,  upload.any(), handleAddNewProductCategory);
router.get('/all-category', authmiddleware, translateMiddleware, handleGetAllCategory);
router.put('/category/update/:categoryId', authmiddleware, upload.any(), handleUpdateProductCategory);
router.delete('/category/delete/:categoryId', authmiddleware, handleDeleteProductCategory);


module.exports = router;
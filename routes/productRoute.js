const express = require('express');
const router = express.Router();
const {handleGetProductDetailsById, handleGetUserProducts, handleGetTraderProductByCategory, handleGetAllTraderProducts, handleAddNewProduct, handleGetAllProducts, handleDeleteProductImage, handleGetProductByCategory, handleUpdateProduct, handleDeleteProduct, handleUpdateProductImages} = require('../controllers/productController');
const upload = require('../multer/multerconfig');
const authmiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');
const {handleAddNewProductCategory, handleGetAllCategory, handleDeleteProductCategory, handleUpdateProductCategory} = require('../controllers/productCategoryController');
const {searchProduct} = require('../controllers/searchController');

// Product Routes
router.post('/add', authmiddleware, handleAddNewProduct);
router.get('/all-products', authmiddleware, translateMiddleware, handleGetAllProducts);
router.post('/productlist', authmiddleware, translateMiddleware, handleGetProductByCategory);
router.get('/my-products', authmiddleware, translateMiddleware, handleGetUserProducts);
router.put('/update/:productId',authmiddleware, handleUpdateProduct);
router.delete('/delete/:productId',authmiddleware, handleDeleteProduct);
router.delete('/image/delete/:productImageID',authmiddleware, handleDeleteProductImage);

// Trader role route 
router.get('/trader/all-products', authmiddleware, translateMiddleware, handleGetAllTraderProducts);
router.post('/trader/productlist', authmiddleware, translateMiddleware, handleGetTraderProductByCategory);

// Search Routes
router.get('/search ', authmiddleware, translateMiddleware, searchProduct);

// Category Routes
router.post('/category/add', authmiddleware,  upload.any(), handleAddNewProductCategory);
router.get('/all-category', authmiddleware, translateMiddleware, handleGetAllCategory);
router.put('/category/update/:categoryId', authmiddleware, upload.any(), handleUpdateProductCategory);
router.delete('/category/delete/:categoryId', authmiddleware, handleDeleteProductCategory);

// Product detail with user detail
router.post('/get-details', authmiddleware, handleGetProductDetailsById);



module.exports = router;
const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Inventory = require('../models/inventory');
import dbConnect from '../lib/mongodb';

// Add Product
async function handleAddNewProduct(req, res) {
    await dbConnect(); // ✅ dbConnect called
    const { productname, category, description, quantity, priceperquantity } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    if ( !productname || !category || !description || !quantity || !priceperquantity) {
        return res.status(400).json({
            status: false, 
            message: "Please fill full details"
        });
    }

    try {
        const product = new Product({
            userId: req.userId,
            productname,
            category,
            description,
            quantity,
            priceperquantity,
            images: imagePaths,
        });

        await product.save();

        const newInventory = new Inventory({
            productId: product._id,
            quantity,
            status: "ongoing",
            userId: req.userId
        })

        await newInventory.save();
        product.inventoryId = newInventory._id;
        await product.save();
        res.status(200).json({
            status: true, 
            message: 'Product added successfully', 
            response: {
                product   
            } 
        });
    } catch (err) {
        res.status(500).json({
            status: false, 
            message: 'Error adding product', 
            response: {                
                error: err.message 
            }
        });
    }
};

// / Get all products
async function handleGetAllProducts(req, res) {
    await dbConnect(); // ✅ dbConnect called
    try {
        const products = await Product.find();
        const productList = products.map(product => ({
            ProductName: product.productname,
            Category: product.category,
            Description: product.description,
            Price: product.priceperquantity
        }));
        res.status(200).json({
            status: true,
            response: {
                Product: productList
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server error', 
            response: {                
                error: error.message 
            }
        });
    }
};

// Get products by category
async function handleGetProductByCategory (req, res) {
    await dbConnect(); // ✅ dbConnect called
    try {
        const { category } = req.params;

        const products = await Product.find({ category });

        if (products.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No products found for this category' 
            });
        }

        const productList = products.map(product => ({
            ProductName: product.productname,
            Category: product.category,
            Description: product.description,
            Price: product.priceperquantity
        }));

        res.status(200).json({
            status: true,
            response: {                
                Product: productList
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server error',
            response: {
                error: error.message                 
            }
        });
    }
};

// Get User Products
async function handleGetUserProducts(req, res) {
    await dbConnect(); // ✅ dbConnect called
    try {
        const products = await Product.find({ userId: req.userId });
        res.status(200).json({
            status: true,
            response: {
                products
            }
        });
    } catch (err) {
        res.status(500).json({ 
            status: false,
            message: 'Error fetching products',
            response: {
                error: err.message                 
            }
        });
    }
};

const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, '/');
};

async function handleUpdateProduct(req, res) {
    await dbConnect(); // ✅ dbConnect called
    const { productId } = req.params;
    const {
        productname,
        category,
        description,
        quantity,
        priceperquantity,
        deleteImage
    } = req.body;

    const newImagePaths = req.files ? req.files.map(file => normalizePath(file.path)) : [];

    let imagesToDeleteArray = [];

    if (deleteImage) {
        if (typeof deleteImage === 'string') {
            try {
                imagesToDeleteArray = JSON.parse(deleteImage);
            } catch (e) {
                imagesToDeleteArray = [deleteImage];
            }
        } else if (Array.isArray(deleteImage)) {
            imagesToDeleteArray = deleteImage;
        }
    }

    if (!productId) {
        return res.status(400).json({ 
            status: false, 
            message: 'Product ID is required' 
        });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ 
                status: false, 
                message: 'Product not found' 
            });
        }

        if (product.userId.toString() !== req.userId) {
            return res.status(403).json({ 
                status: false, 
                message: 'Unauthorized' 
            });
        }

        if (imagesToDeleteArray.length > 0) {
            imagesToDeleteArray.forEach(imagePath => {
                const normalizedImagePathToDelete = normalizePath(imagePath);

                const index = product.images.findIndex(img => normalizePath(img) === normalizedImagePathToDelete);

                if (index > -1) {
                    product.images.splice(index, 1);

                    const absolutePath = path.resolve(imagePath);

                    fs.unlink(absolutePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete file from filesystem: ${absolutePath}`, err);
                        } else {
                            console.log(`File deleted from filesystem: ${absolutePath}`);
                        }
                    });
                } else {
                    console.warn(`Image path not found in product.images: ${imagePath}`);
                }
            });
        }

        if (newImagePaths.length > 0) {
            product.images.push(...newImagePaths);
        }

        if (productname) product.productname = productname;
        if (category) product.category = category;
        if (description) product.description = description;

        if (quantity !== undefined && !isNaN(quantity)) {
            product.quantity = quantity;

            const inventory = await Inventory.findOne({ productId: product._id });

            if (inventory) {
                inventory.quantity = quantity;
                await inventory.save();
                console.log(`Inventory updated for product ${product._id}`);
            } else {
                console.warn(`No inventory record found for product ${product._id}`);
            }
        }

        if (priceperquantity !== undefined && !isNaN(priceperquantity)) {
            product.priceperquantity = priceperquantity;
        }

        await product.save();

        res.status(200).json({
            status: true,
            message: 'Product updated successfully',
            response: {                
                product
            }
        });

    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({
            status: false,
            message: 'Error updating product',
            response: {
                error: err.message
            }
        });
    }
}

// Delete Product
async function handleDeleteProduct (req, res) {
    await dbConnect(); // ✅ dbConnect called
    const { productId } = req.params;

    try {
        const product = await Product.findOneAndDelete({ _id: productId, userId: req.userId });
        if (!product) return res.status(404).json({
                status: false,
                message: 'Product not found' 
            });
        await Inventory.deleteMany({productId: productId});
        res.status(200).json({
            status: true,
            message: 'Product deleted successfully' 
            });
    } catch (err) {
        res.status(500).json({ 
            status: false,
            message: 'Error deleting product',
            response: {
                error: err.message                 
            } 
        });
    }
};

// Search Function

async function searchProduct(req, res){
    await dbConnect();
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Please provide a search query.' });
    }

    try {
        const searchRegex = new RegExp(searchQuery, 'i'); // case-insensitive

        let query = {
            $or: [
                { productname: searchRegex },
                { category: searchRegex },
                { description: searchRegex }
            ]
        };

        if (!isNaN(searchQuery)) {
            query.$or.push({ quantity: Number(searchQuery) });
            query.$or.push({ priceperquantity: Number(searchQuery) });
        }

        const results = await Product.find(query);

        if (results.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No result was found.',
                response: null,
             });
        }

        res.status(200).json({
            status: true,
            message: 'Search successful',
            response: {
                totalResults: results.length,
                result: results
            }
        });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error',
            response: null,
            error: error,
            errormessage: error.message
        });
    }
};


module.exports = {
    handleAddNewProduct,
    handleGetAllProducts,
    handleGetProductByCategory,
    handleUpdateProduct,
    handleDeleteProduct,
    handleGetUserProducts,
    searchProduct,
}


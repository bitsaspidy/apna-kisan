const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const ProductCategory = require('../models/productCategory');
const getNextSequence = require("../utils/counterService");
const User = require("../models/user");
const ProductImage = require('../models/productImage');
const moment = require('moment');

const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, '/');
};

// Add Product
async function handleAddNewProduct(req, res) {
    const { productname, categoryName, description, quantity, priceperquantity, quantityUnit } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    if (!productname || !categoryName || !description || !quantity || !priceperquantity || !quantityUnit) {
        return res.status(200).json({ status: false , message: "Please fill full details", response: null });
    }

    const categoryDoc = await ProductCategory.findOne({ name: categoryName });

    if (!categoryDoc) {
        return res.status(200).json({ status: false, message: 'Category not found', response: null });
    }

    const userDoc = await User.findById(req.userId);
    if (!userDoc) {
        return res.status(200).json({ status: false, message: 'User not found', response: null });
    }

    try {
        const nextProductId = await getNextSequence('productid');
        const product = new Product({
            userId: req.userId,
            productname,
            categoryId: categoryDoc._id,
            description,
            quantity,
            priceperquantity,
            quantityUnit,
            productID: nextProductId,
        });

        await product.save();

        const imageDocuments = [];

        for (const path of imagePaths) {
            const nextProductImageId = await getNextSequence('productimageid'); // ✅ call for each image
            imageDocuments.push({
                productId: product._id,
                imageUrl: path,
                productImageID: nextProductImageId
            });
        }

        await ProductImage.insertMany(imageDocuments);

        const nextInventoryId = await getNextSequence('inventoryid');
        const newInventory = new Inventory({
            inventoryID: nextInventoryId,
            productId: product._id,
            quantity,
            quantityUnit,
            status: "ongoing",
            userId: req.userId
        });

        await newInventory.save();
        product.inventoryId = newInventory._id;
        await product.save();

        const productImages = await ProductImage.find({ productId: product._id });

        const formattedImages = productImages.map(img => ({
            productImageId: img.productImageID,
            productImagePath: img.imageUrl
          }));

        const productResponse = {
            categoryId: categoryDoc.categoryID,
            categoryName: categoryDoc.name,
            productId: product.productID,
            productName: product.productname,
            productDescription: product.description,
            productImages: formattedImages,
            productQuantity: product.quantity,
            quantityUnit: product.quantityUnit,
            productPrice: product.priceperquantity,
            createdAt:  moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        };

        res.status(200).json({ 
            status: true, 
            message: 'Product added successfully', 
            response: {
                productResponse   
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
    try {
        const products = await Product.find();

        if(products.length === 0){
            return res.status(200).json({
                status: false,
                message: "Product list not found",
                response: {
                 productList: []
                }
            });
        }

        const productList = await Promise.all(products.map(async product => {
            const category = await ProductCategory.findById(product.categoryId);
            const productImages = await ProductImage.find({ productId: product._id });

            return {
                categoryId: category.categoryID,
                categoryName: category.name,
                productId: product.productID,
                productName: product.productname,
                productDescription: product.description,
                productImages: productImages.map(img => ({
                    productImageId: img.productImageID.toString(),
                    productImagePath: img.imageUrl
                })),
                productQuantity: product.quantity,
                quantityUnit: product.quantityUnit,
                productPrice: product.priceperquantity,
                createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss')
            };
        }));

        res.status(200).json({
            status: true,
            message: "Product list is fetched sucessfully",
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

async function handleGetProductByCategory(req, res) {
    const  categoryID  = req.body.categoryID || 4;

    console.log("categoryID:", categoryID);

    if (!categoryID) {
        return res.status(200).json({ status: false, message: "Category ID is required" , response: null });
    }

    try {
        // Find the category document
        const categoryDoc = await ProductCategory.findOne({ 
            categoryID: categoryID
        });

        if (!categoryDoc) {
            return res.status(200).json({ status: false, message: 'Category not found', response: null });
        }

        // Find products by categoryId
        const products= await Product.find({ categoryId: categoryDoc._id , userId: req.userId});

        if (!products.length) {
            return res.status(200).json({
                status: false,
                message: `Product list not found`,
                Response: {
                    Productlist: []
                }
            });
        }


        const productList = await Promise.all(products.map(async item => {
            const productImages = await ProductImage.find({ productId: item._id });

            return {
                categoryId: categoryDoc.categoryID,
                categoryName: categoryDoc.name,
                productId: item.productID,
                productName: item.productname,
                productDescription: item.description,
                productImages: productImages.map(img => ({
                    productImageId: img.productImageID.toString(),
                    productImagePath: img.imageUrl
                })),
                productQuantity: item.quantity,
                quantityUnit: item.quantityUnit,
                productPrice: item.priceperquantity,
                createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
            };
        }));

        res.status(200).json({
            status: true,
            message: `Product List is fetched successfully`,
            response: {                
                Product: productList
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
}

async function handleGetUserProducts(req, res) {
    try {   

        const products = await Product.find({userId: req.userId});

        if(products.length === 0) {
            return res.status(200).json({
                status: true,
                message: "Product list not found",
                response: {
                    productList: []
                }
            });
        }

        const productList = await Promise.all(products.map(async product => {
            const category = await ProductCategory.findById(product.categoryId);
            const images = await ProductImage.find({ productId: product._id });
            return {

            categoryId: category.categoryID,
            categoryName: category ? category.name : 'Unknown',
            productId: product.productID,
            productName: product.productname,
            productDescription: product.description,
            productImages: images.map(img => ({
                productImageId: img.productImageID.toString(),
                productImagePath: img.imageUrl
            })),
            productQuantity: product.quantity,
            quantityUnit: product.quantityUnit,
            productPrice: product.priceperquantity,
            createdAt:  moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss'),

            };
        }));

        res.status(200).json({
            status: true,
            message: "Product list is fetched sucessfully",
            response: {
                productList
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


async function handleUpdateProduct(req, res) {

    const { productId } = req.params;
    const {
        productname,
        categoryName,
        description,
        quantity,
        priceperquantity,
        quantityUnit,
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
        return res.status(200).json({ status: false, message: 'Product ID is required', response: null });
    }

    try {
        const product = await Product.findOne({productID: productId});

        if (!product) {
            return res.status(200).json({ status: false, message: 'Product not found' , response: null});
        }

        if (product.userId.toString() !== req.userId) {
            return res.status(403).json({ status: false, message: 'Unauthorized', response: null});
        }

        // ✅ Delete selected images
        if (imagesToDeleteArray.length > 0) {
            for (const imageId of imagesToDeleteArray) {
                const parsedId = Number(imageId);
                if (isNaN(parsedId)) {
                    console.warn(`Skipping invalid image ID: ${imageId}`);
                    continue;
                }
            
                const imageDoc = await ProductImage.findOneAndDelete({ productImageID: parsedId, productId: product._id });
            
                if (imageDoc) {
                    const absolutePath = path.resolve(imageDoc.imageUrl);
                    fs.unlink(absolutePath, (err) => {
                        if (err) console.error(`Failed to delete file: ${absolutePath}`, err);
                        else console.log(`File deleted: ${absolutePath}`);
                    });
                }
            }
        }

        const imageDocuments = [];
        for (const imagePath of newImagePaths) {
            const nextImageId = await getNextSequence('productimageid');
            imageDocuments.push({
                productId: product._id,
                imageUrl: imagePath,
                productImageID: nextImageId
            });
        }
        if (imageDocuments.length > 0) await ProductImage.insertMany(imageDocuments);

        if (productname) product.productname = productname;
        if (categoryName) {
            const categoryDoc = await ProductCategory.findOne({ name: categoryName });

            if (!categoryDoc) {
                return res.status(200).json({ status: false, message: 'Category not found', response: null });
            }

            product.categoryId = categoryDoc._id;
        }

        if (description) product.description = description;
        if (quantityUnit) product.quantityUnit = quantityUnit;

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
        if (quantityUnit !== undefined && quantityUnit == '') {
            product.quantityUnit = quantityUnit;

            const inventory = await Inventory.findOne({ productId: product._id });

            if (inventory) {
                inventory.quantityUnit = quantityUnit;
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
        const productImages = await ProductImage.find({ productId: product._id });

        const productResponse = {
            productID: product.productID,
            productName: product.productname,
            categoryName: categoryName,
            description: product.description,
            quantity: product.quantity,
            quantityUnit: product.quantityUnit,
            pricePerQuantity: product.priceperquantity,
            productImages: productImages.map(img => ({
                productImageId: img.productImageID.toString(),
                productImagePath: img.imageUrl
            })),
            createdAt:  moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        };

        res.status(200).json({
            status: true,
            message: 'Product updated successfully',
            response: {                
                productResponse
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
    const { productId } = req.params;

    try {
        const product = await Product.findOneAndDelete({ productID: productId, userId: req.userId });
        if (!product) return res.status(200).json({
                status: false,
                message: 'Product not found' 
            });
        const images = await ProductImage.find({ productId: product._id });
        for (const image of images) {
            const imagePath = path.resolve(image.imageUrl);
            fs.unlink(imagePath, err => {
                if (err) {
                    console.error(`Failed to delete image file: ${imagePath}`, err);
                } else {
                    console.log(`Deleted image file: ${imagePath}`);
                }
            });
        }
        await ProductImage.deleteMany({ productId: product._id });
        await Inventory.deleteMany({productID: productId});
        res.status(200).json({
            status: true,
            message: 'Product deleted successfully' ,
            response: null
            });
    } catch (err) {
        res.status(200).json({ 
            status: false,
            message: 'Error deleting product',
            response: {
                error: err.message                 
            } 
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
}


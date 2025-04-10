const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const ProductCategory = require('../models/productCategory');
const getNextSequence = require("../utils/counterService");
const User = require("../models/user");
const ProductImage = require('../models/productImage');
const moment = require('moment');
const ProductCartMeta = require('../models/productCartMeta');

const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, '/');
};

// Add Product

async function handleAddNewProduct(req, res) {
    const { productname, categoryname, description, quantity, priceperquantity, quantityunit, images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(200).json({
            status: false,
            message: 'Please provide images',
            response: []
        });
    }

    if (images.length > 5) {
        return res.status(200).json({
            status: false,
            message: 'You can upload a maximum of 5 images only!',
            response: []
        });
    }

    if (!productname || !categoryname || !description || !quantity || !priceperquantity || !quantityunit) {
        return res.status(200).json({ status: false, message: "Please fill full details", response: null });
    }

    try {
        const [categoryDoc, userDoc] = await Promise.all([
            ProductCategory.findOne({ name: categoryname }),
            User.findById(req.userId)
        ]);

        if (!categoryDoc) {
            return res.status(200).json({ status: false, message: 'Category not found', response: null });
        }

        if (!userDoc) {
            return res.status(200).json({ status: false, message: 'User not found', response: null });
        }

        const imagePaths = [];
        const timestamp = Date.now();

        await Promise.all(images.map(async (base64String, i) => {
            base64String = base64String.replace(/\r?\n|\r/g, '');
            const buffer = Buffer.from(base64String, 'base64');
            const extension = 'jpeg';
            const fileName = `product_${timestamp}_${i}.${extension}`;
            const filePath = path.join(__dirname, '../uploads', fileName);
            await fs.promises.writeFile(filePath, buffer);
            imagePaths.push(`uploads/${fileName}`);
        }));

        const [nextProductId ] = await Promise.all([
            getNextSequence('productid'),
        ]);

        const product = new Product({
            userId: req.userId,
            productname,
            categoryId: categoryDoc._id,
            description,
            quantity,
            priceperquantity,
            quantityunit,
            productID: nextProductId
        });

        await product.save();

        const imageDocuments = await Promise.all(imagePaths.map(async (imagePath) => {
            const nextProductImageId = await getNextSequence('productimageid');
            return {
                productId: product._id,
                imageUrl: imagePath,
                productImageID: nextProductImageId
            };
        }));

        await ProductImage.insertMany(imageDocuments);

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
            quantityUnit: product.quantityunit,
            productPrice: product.priceperquantity,
            createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        };

        res.status(200).json({
            status: true,
            message: 'Product added successfully',
            response: productResponse
        });

    } catch (err) {
        if (Array.isArray(imagePaths) && imagePaths.length > 0) {
            for (const imagePath of imagePaths) {
                const fullPath = path.resolve(imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) console.error('Cleanup error:', err.message);
                });
            }
        }

        res.status(500).json({
            status: false,
            message: 'Error adding product',
            response: { error: err.message }
        });
    }
}

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

        const metaList = await ProductCartMeta.find({ userId: req.userId });
        const metaMap = new Map(metaList.map(meta => [meta.productId.toString(), meta]));

        const filteredProducts = products.filter(p => p.quantity > 0);

        const productList = await Promise.all(filteredProducts.map(async product => {
            const category = await ProductCategory.findById(product.categoryId);
            const productImages = await ProductImage.find({ productId: product._id });
            const meta = metaMap.get(product._id.toString());

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
                quantityUnit: product.quantityunit,
                productPrice: product.priceperquantity,
                cart_status: meta ? meta.cart_status : false,
                cart_quantity: meta ? meta.cart_quantity : 0,
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
        const categoryDoc = await ProductCategory.findOne({ 
            categoryID: categoryID
        });

        if (!categoryDoc) {
            return res.status(200).json({ status: false, message: 'Category not found', response: null });
        }

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

        const metaList = await ProductCartMeta.find({ userId: req.userId });
        const metaMap = new Map(metaList.map(meta => [meta.productId.toString(), meta]));

        const filteredProducts = products.filter(p => p.quantity > 0);

        const productList = await Promise.all(filteredProducts.map(async item => {
            const productImages = await ProductImage.find({ productId: item._id });
            const meta = metaMap.get(item._id.toString());

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
                quantityUnit: item.quantityunit,
                productPrice: item.priceperquantity,
                cart_status: meta ? meta.cart_status : false,
                cart_quantity: meta ? meta.cart_quantity : 0,
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

        const metaList = await ProductCartMeta.find({ userId: req.userId });
        const metaMap = new Map(metaList.map(meta => [meta.productId.toString(), meta]));

        const filteredProducts = products.filter(p => p.quantity > 0);

        const productList = await Promise.all(filteredProducts.map(async product => {
            const category = await ProductCategory.findById(product.categoryId);
            const images = await ProductImage.find({ productId: product._id });
            const meta = metaMap.get(product._id.toString());
            
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
            quantityUnit: product.quantityunit,
            productPrice: product.priceperquantity,
            cart_status: meta ? meta.cart_status : false,
            cart_quantity: meta ? meta.cart_quantity : 0,
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
    try {
        const { productId } = req.params;
        const {
            productname,
            categoryname,
            description,
            quantity,
            priceperquantity,
            quantityunit,
            images 
        } = req.body;

        const product = await Product.findOne({ productID: productId });
        if (!product) {
            return res.status(200).json({ status: false, message: 'Product not found', response: null });
        }

        if (product.userId.toString() !== req.userId) {
            return res.status(200).json({ status: false, message: 'Unauthorized', response: null });
        }

        const currentImageCount = await ProductImage.countDocuments({ productId: product._id });
        const imagePaths = [];
        if (images && Array.isArray(images)) {
            const totalAfterAddingNew = currentImageCount + images.length;

            if (totalAfterAddingNew > 5) {
                return res.status(200).json({
                    status: false,
                    message: 'You can upload a maximum of 5 images only!',
                    response: null
                });
            }

            const timestamp = Date.now();
            await Promise.all(images.map(async (base64String, i) => {
                base64String = base64String.replace(/\r?\n|\r/g, '');
                const buffer = Buffer.from(base64String, 'base64');
                const extension = 'jpeg';
                const fileName = `product_${timestamp}_${i}.${extension}`;
                const filePath = path.join(__dirname, '../uploads', fileName);
                await fs.promises.writeFile(filePath, buffer);
                imagePaths.push(`uploads/${fileName}`);
            }));

            const imageDocuments = await Promise.all(imagePaths.map(async (imagePath) => {
                const nextImageId = await getNextSequence('productimageid');
                return {
                    productId: product._id,
                    imageUrl: imagePath,
                    productImageID: nextImageId
                };
            }));

            if (imageDocuments.length > 0) {
                await ProductImage.insertMany(imageDocuments);
            }
        }

        if (productname) product.productname = productname;
        let categoryDoc;

        if (categoryname) {
            categoryDoc = await ProductCategory.findOne({ name: categoryname });
            if (!categoryDoc) {
                return res.status(200).json({ status: false, message: 'Category not found', response: null });
            }
            product.categoryId = categoryDoc._id;
        } else {
            categoryDoc = await ProductCategory.findById(product.categoryId);
        }

        if (description) product.description = description;
        if (quantity !== undefined && !isNaN(quantity)) product.quantity = quantity;
        if (quantityunit !== undefined) product.quantityunit = quantityunit;
        if (priceperquantity !== undefined && !isNaN(priceperquantity)) product.priceperquantity = priceperquantity;

        await product.save();

        const productImages = await ProductImage.find({ productId: product._id });

        const productResponse = {
            productID: product.productID,
            productName: product.productname,
            categoryName: categoryDoc?.name || null,
            categoryID: categoryDoc?.categoryID || null,
            description: product.description,
            quantity: product.quantity,
            quantityUnit: product.quantityunit,
            pricePerQuantity: product.priceperquantity,
            productImages: productImages.map(img => ({
                productImageId: img.productImageID.toString(),
                productImagePath: img.imageUrl
            })),
            createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        };

        res.status(200).json({
            status: true,
            message: 'Product updated successfully',
            response: productResponse
        });

    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({
            status: false,
            message: 'Error updating product',
            response: { error: err.message }
        });
    }
}

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
        res.status(200).json({
            status: true,
            message: 'Product deleted successfully' ,
            response: null
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

async function handleDeleteProductImage(req, res) {
    const { productImageID } = req.params;

    try {
        const image = await ProductImage.findOne({ productImageID: Number(productImageID) });
        if (!image) {
            return res.status(200).json({
                status: false,
                message: 'Image not found',
                response: null
            });
        }

        const product = await Product.findById(image.productId);
        if (!product || product.userId.toString() !== req.userId) {
            return res.status(200).json({
                status: false,
                message: 'Unauthorized to delete this image'
            });
        }

        const absolutePath = path.resolve(image.imageUrl);
        fs.unlink(absolutePath, (err) => {
            if (err) console.error('Failed to delete image file:', err);
        });

        await ProductImage.deleteOne({ _id: image._id });

        res.status(200).json({
            status: true,
            message: 'Image deleted successfully',
            response: null
        });

    } catch (err) {
        console.error('Error deleting product image:', err);
        res.status(500).json({
            status: false,
            message: 'Error deleting image',
            response: { error: err.message }
        });
    }
}

async function handleGetAllTraderProducts(req, res) {
    try {

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'User not found',
                response: null
            });
        }

        if (user.role !== 'trader') {
            return res.status(200).json({
                status: false,
                message: 'Unauthorized access: only traders can view products',
                response: null
            });
        }

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

        
        const metaList = await ProductCartMeta.find({ userId: req.userId });
        const metaMap = new Map(metaList.map(meta => [meta.productId.toString(), meta]));

        const filteredProducts = products.filter(p => p.quantity > 0);

        const productList = await Promise.all(filteredProducts.map(async (product) => {
            const [category, productImages] = await Promise.all([
                ProductCategory.findById(product.categoryId),
                ProductImage.find({ productId: product._id })
            ]);
            const meta = metaMap.get(product._id.toString());

            return {
                categoryId: category?.categoryID || null,
                categoryName: category?.name || null,
                productId: product.productID,
                productName: product.productname,
                productDescription: product.description,
                productImages: productImages.map(img => ({
                    productImageId: img.productImageID.toString(),
                    productImagePath: img.imageUrl
                })),
                productQuantity: product.quantity,
                quantityUnit: product.quantityunit,
                productPrice: product.priceperquantity,
                cart_status: meta ? meta.cart_status : false,
                cart_quantity: meta ? meta.cart_quantity : 0,
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

async function handleGetTraderProductByCategory(req, res) {
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(200).json({
            status: false,
            message: 'User not found',
            response: null
        });
    }

    if (user.role !== 'trader') {
        return res.status(200).json({
            status: false,
            message: 'Unauthorized access: only traders can view products',
            response: null
        });
    }

    const  categoryID  = req.body.categoryID || 4;

    console.log("categoryID:", categoryID);

    if (!categoryID) {
        return res.status(200).json({ status: false, message: "Category ID is required" , response: null });
    }

    try {
        const categoryDoc = await ProductCategory.findOne({ 
            categoryID: categoryID
        });

        if (!categoryDoc) {
            return res.status(200).json({ status: false, message: 'Category not found', response: null });
        }

        const products= await Product.find({ categoryId: categoryDoc._id});

        if (!products.length) {
            return res.status(200).json({
                status: false,
                message: `Product list not found`,
                Response: {
                    Productlist: []
                }
            });
        }

        const metaList = await ProductCartMeta.find({ userId: req.userId });
        const metaMap = new Map(metaList.map(meta => [meta.productId.toString(), meta]));

        const filteredProducts = products.filter(p => p.quantity > 0);

        const productList = await Promise.all(filteredProducts.map(async item => {
            const productImages = await ProductImage.find({ productId: item._id });
            const meta = metaMap.get(item._id.toString());
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
                quantityUnit: item.quantityunit,
                productPrice: item.priceperquantity,
                cart_status: meta ? meta.cart_status : false,
                cart_quantity: meta ? meta.cart_quantity : 0,
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

async function handleGetProductDetailsById(req, res) {
    const { productID } = req.body;

    if (!productID) {
        return res.status(200).json({ status: false, message: "Product ID is required", response: [] });
    }

    try {
        const product = await Product.findOne({ productID });

        if (!product) {
            return res.status(200).json({ status: false, message: "Product not found", response: [] });
        }

        const category = await ProductCategory.findById(product.categoryId);

        const images = await ProductImage.find({ productId: product._id });

        const user = await User.findById(product.userId);

        if (!user) {
            return res.status(200).json({ status: false, message: "User not found", response: [] });
        }

        const productDetails = {
            categoryId: category ? category.categoryID : null,
            categoryName: category ? category.name : null,
            productId: product.productID,
            productName: product.productname,
            productDescription: product.description,
            productImages: images.map(img => ({
                productImageId: img.productImageID,
                productImagePath: img.imageUrl
            })),
            productQuantity: product.quantity,
            quantityUnit: product.quantityunit,
            productPrice: product.priceperquantity,
            createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm:ss'),

            addedBy: {
                name: user.name,
                phoneNumber: user.phonenumber
            }
        };

        return res.status(200).json({
            status: true,
            message: "Product details fetched successfully",
            response: productDetails
        });

    } catch (error) {
        console.error("Get product by ID error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            response: { error: error.message }
        });
    }
}


module.exports = {
    handleAddNewProduct,
    handleGetAllProducts,
    handleGetProductByCategory,
    handleUpdateProduct,
    handleDeleteProduct,
    handleGetUserProducts,
    handleDeleteProductImage,
    handleGetAllTraderProducts,
    handleGetTraderProductByCategory,
    handleGetProductDetailsById
}


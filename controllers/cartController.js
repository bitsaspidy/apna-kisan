const Cart = require('../models/cart');
const Product = require('../models/product');
const ProductImage = require('../models/productImage');
const ProductCategory = require('../models/productCategory');
const getNextSequence = require("../utils/counterService");
const ProductCartMeta = require('../models/productCartMeta');


async function addToCart(req, res) {
    try {
        const userId = req.userId;
        const { productID } = req.body;

        if (!productID) {
            return res.status(200).json({ status: false, message: 'productID is required', response: [] });
        }

        const product = await Product.findOne({ productID });
        if (!product) {
            return res.status(200).json({ status: false, message: 'Product not found', response: [] });
        }

        const productObjectId = product._id;
        const productUnitPrice = product.priceperquantity;

        if (product.quantity <= 0) {
            return res.status(200).json({
                status: false,
                message: 'Product is out of stock',
                response: []
            });
        }

        let cart = await Cart.findOne({ userId });

        let cartitemID = null;
        let productquantity = 1;
        let totalPrice = productUnitPrice;

        if (!cart) {
            cartitemID = await getNextSequence('itemid');
            const item = {
                productId: productObjectId,
                quantity: 1,
                price: productUnitPrice,
                cartitemID: cartitemID
            };

            cart = new Cart({
                userId,
                items: [item]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productObjectId.toString());

            if (itemIndex > -1) {
                if (product.quantity <= 0) {
                    return res.status(200).json({
                        status: false,
                        message: 'No more stock available for this product',
                        response: []
                    });
                }

                cart.items[itemIndex].quantity += 1;
                productquantity = cart.items[itemIndex].quantity;
                totalPrice = productquantity * productUnitPrice;
                cart.items[itemIndex].price = totalPrice;
                cartitemID = cart.items[itemIndex].cartitemID;
            } else {
                cartitemID = await getNextSequence('itemid');
                totalPrice = productUnitPrice * 1;

                cart.items.push({
                    productId: productObjectId,
                    quantity: 1,
                    price: totalPrice,
                    cartitemID
                });
            }
        }

        await cart.save();

        product.quantity -= 1;
        await product.save();

        
        await ProductCartMeta.findOneAndUpdate(
            { userId, productId: product._id },
            {
              cart_status: true,
              cart_quantity: productquantity
            },
            { upsert: true, new: true }
        );

        const productImageDoc = await ProductImage.findOne({ productId: productObjectId });
        const productimage = productImageDoc ? productImageDoc.imageUrl : null;

        const category = await ProductCategory.findById(product.categoryId);
        const categoryName = category ? category.name : null;

        const responseItem = {
            productID: product.productID,
            productname: product.productname,
            productprice: product.priceperquantity,
            productimage: productimage,
            quantityunit: product.quantityunit,
            productquantity: productquantity,
            cartitemID: cartitemID,
            categoryName: categoryName,
            price: totalPrice,
            remainingStock: product.quantity
        };

        res.status(200).json({
            status: true,
            message: 'Product added to cart',
            response: responseItem
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error',
            response: error.message
        });
    }
}


async function viewCart(req, res) {
    try {
        const userId = req.userId;

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'Cart is empty',
                response: [],
                totalCartPrice: 0
            });
        }

        let totalCartPrice = 0;

        const result = await Promise.all(cart.items.map(async item => {
            const product = item.productId;
            if (!product) return null;

            const imageDoc = await ProductImage.findOne({ productId: product._id });
            const productimage = imageDoc ? imageDoc.imageUrl : null;

            const categoryDoc = await ProductCategory.findById(product.categoryId);
            const categoryName = categoryDoc ? categoryDoc.name : null;

            totalCartPrice += item.price || 0;

            return {
                productID: product.productID,
                productname: product.productname,
                productprice: product.priceperquantity,
                productquantity: item.quantity,
                quantityunit: product.quantityunit,
                price: item.price,
                productimage: productimage,
                cartitemID: item.cartitemID,
                categoryName: categoryName,
                remainingStock: product.quantity
            };
        }));

        cart.totalCartPrice = totalCartPrice;
        await cart.save();


        res.status(200).json({
            status: true,
            message: "cart item fetched successfully",
            response: result.filter(Boolean),
            Total: totalCartPrice
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server error',
            response: error.message
        });
    }
}

async function updateCartQuantity(req, res) {
    try {
        const userId = req.userId;
        const { productID, operation, quantity } = req.body;

        if (!productID || (!operation && quantity === undefined)) {
            return res.status(200).json({
                status: false,
                message: 'productID and either operation or quantity are required',
                response: []
            });
        }

        const product = await Product.findOne({ productID });
        if (!product) {
            return res.status(200).json({ status: false, message: 'Product not found', response: [] });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(200).json({ status: false, message: 'Cart not found', response: [] });

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === product._id.toString());
        if (itemIndex === -1) return res.status(200).json({ status: false, message: 'Product not in cart', response: [] });

        let item = cart.items[itemIndex];

        const currentCartQty = item.quantity;
        const stockAvailable = product.quantity + currentCartQty; // total available to this user
        const minQuantity = 1;

        if (quantity !== undefined) {
            // ✅ Prioritize direct quantity setting
            const requestedQty = parseInt(quantity);
        
            if (isNaN(requestedQty) || requestedQty < minQuantity) {
                return res.status(200).json({
                    status: false,
                    message: `Invalid quantity. Minimum quantity is ${minQuantity}.`,
                    response: []
                });
            }
        
            if (requestedQty > stockAvailable) {
                return res.status(200).json({
                    status: false,
                    message: `Only ${stockAvailable} available in stock.`,
                    response: []
                });
            }
        
            const diff = requestedQty - currentCartQty;
            item.quantity = requestedQty;
            product.quantity -= diff;
        
        } else if (operation === 'increment') {
            if (currentCartQty >= stockAvailable) {
                return res.status(200).json({
                    status: false,
                    message: `Only ${product.quantity} more in stock. Cannot add more.`,
                    response: []
                });
            }
            item.quantity += 1;
            product.quantity -= 1;
        
        } else if (operation === 'decrement') {
            if (currentCartQty <= minQuantity) {
                return res.status(200).json({
                    status: false,
                    message: `Minimum quantity is ${minQuantity}. Cannot decrement further.`,
                    response: []
                });
            }
            item.quantity -= 1;
            product.quantity += 1;
        
        } else {
            return res.status(200).json({
                status: false,
                message: 'Invalid operation or quantity',
                response: []
            });
        }

        // 🔄 Update item price
        item.price = item.quantity * product.priceperquantity;

        // 🔄 Update totalCartPrice
        cart.totalCartPrice = cart.items.reduce((acc, item) => acc + (item.price || 0), 0);

        // 🔄 Save both
        await Promise.all([cart.save(), product.save()]);

        await ProductCartMeta.findOneAndUpdate(
            { userId, productId: product._id },
            {
              cart_status: true,
              cart_quantity: item.quantity
            },
            { upsert: true, new: true }
        );

        // 📸 Product Image
        const imageDoc = await ProductImage.findOne({ productId: product._id });
        const productimage = imageDoc ? imageDoc.imageUrl : null;

        // 📦 Category Name
        const categoryDoc = await ProductCategory.findById(product.categoryId);
        const categoryName = categoryDoc ? categoryDoc.name : null;

        const updatedItem = {
            productID: product.productID,
            productname: product.productname,
            productprice: product.priceperquantity,
            productquantity: item.quantity,
            quantityunit: product.quantityunit,
            price: item.price,
            productimage: productimage,
            cartitemID: item.cartitemID,
            categoryName: categoryName,
            remainingStock: product.quantity
        };

        res.status(200).json({
            status: true,
            message: 'Cart item updated successfully',
            response: updatedItem
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error',
            response: error.message
        });
    }
}


async function removeCartItem(req, res) {
    try {
        const userId = req.userId;
        const { productID } = req.params;

        if (!productID) {
            return res.status(200).json({
                status: false,
                message: 'productID is required',
                response: []
            });
        }

        const product = await Product.findOne({ productID });
        if (!product) {
            return res.status(200).json({
                status: false,
                message: 'Product not found',
                response: []
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(200).json({
                status: false,
                message: 'Cart not found for this user',
                response: []
            });
        }

        const itemIndex = cart.items.findIndex(item =>
            item.productId.toString() === product._id.toString()
        );

        if (itemIndex === -1) {
            return res.status(200).json({
                status: false,
                message: 'Cart item not found for this product',
                response: []
            });
        }

        const removedItem = cart.items[itemIndex];

        product.quantity += removedItem.quantity;

        cart.items.splice(itemIndex, 1);

        cart.totalCartPrice = cart.items.reduce((acc, item) => acc + (item.price || 0), 0);

        await Promise.all([cart.save(), product.save()]);
        await ProductCartMeta.findOneAndUpdate(
            { userId, productId: product._id },
            {
              cart_status: false,
              cart_quantity: 0
            },
            { upsert: true }
        );

        res.status(200).json({
            status: true,
            message: 'Cart item removed successfully and stock restored',
            response: []
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server error',
            response: error.message
        });
    }
}

async function emptyUserCart(req, res) {
    try {
        const userId = req.userId;

        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'Cart is already empty',
                response: []
            });
        }

        // Step 1: Restore product stock
        for (const item of cart.items) {
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { quantity: item.quantity } }
            );
        }

        // Step 2: Clear cart items
        cart.items = [];
        cart.totalCartPrice = 0;
        await cart.save();

        // Step 3: Remove product cart meta for this user
        await ProductCartMeta.deleteMany({ userId });

        res.status(200).json({
            status: true,
            message: 'Cart emptied successfully and all stock restored',
            response: []
        });

    } catch (error) {
        console.error('Empty cart error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error while emptying cart',
            response: error.message
        });
    }
}

module.exports = { addToCart, viewCart, updateCartQuantity, removeCartItem, emptyUserCart };

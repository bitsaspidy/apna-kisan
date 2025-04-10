const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const ProductImage = require('../models/productImage');
const Order = require('../models/order');
const Inventory = require('../models/inventory');
const getNextSequence = require('../utils/counterService');
// const moment = require('moment');

function generateOrderNo() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit
}

function generateInvoiceNo() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  return `INV-${datePart}-${generateOrderNo()}`;
}

async function handleCheckout(req, res) {
    try {
      const userId = req.userId;
  
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(200).json({ status: false, message: 'Cart is empty', response: [] });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(200).json({ status: false, message: 'User not found', response: [] });
      }
  
      const items = await Promise.all(cart.items.map(async item => {
        const product = await Product.findById(item.productId);
        const imageDoc = await ProductImage.findOne({ productId: product._id });
  
        return {
          productId: product._id,
          productID: product.productID,
          productName: product.productname,
          quantity: item.quantity,
          quantityunit: product.quantityunit || null,
          price: item.price,
          image: imageDoc?.imageUrl || ''
        };
      }));
  
      // const totalAmount = cart.totalCartPrice;
      const totalAmount = cart.totalCartPrice || items.reduce((acc, item) => acc + item.price, 0);
      const orderno = generateOrderNo();
      const invoiceno = generateInvoiceNo();
  
      const newOrder = new Order({
        userId,
        orderno,
        invoiceno,
        user: {
          fullName: user.name,
          mobile: user.phonenumber,
          address: user.location
        },
        items,
        totalAmount,
        status: 'ongoing'
      });
  
      const savedOrder = await newOrder.save();
  
      await Promise.all(items.map(async item => {
        const product = await Product.findById(item.productId);
      
        if (product) {
          const inventoryID = await getNextSequence('inventoryid');
      
          const newInventory = new Inventory({
            productId: product._id,
            userId: product.userId, // ✅ assign to farmer
            quantity: item.quantity,
            quantityunit: product.quantityunit,
            status: 'ongoing',
            inventoryID
          });
      
          await newInventory.save();
        }
      }));
  
      // ✅ Empty the cart
      cart.items = [];
      cart.totalCartPrice = 0;
      await cart.save();
  
      res.status(200).json({
        status: true,
        message: 'Checkout complete. Order placed successfully.',
        response: {
          orderno,
          invoiceno,
          totalAmount,
          items,
          user: {
            name: user.name,
            mobile: user.phonenumber,
            address: user.location
          }
        }
      });
  
    } catch (error) {
      console.error('Checkout Error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error during checkout',
        response: error.message
      });
    }
  }

module.exports = {handleCheckout};

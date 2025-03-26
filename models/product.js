const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    productname: { 
        type: String, 
        required: true 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory', 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    quantityUnit: { 
        type: String, 
        required: true 
    },
    priceperquantity: { 
        type: Number, 
        required: true 
    },
    inventoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Inventory', 
    },
    productID: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema)

module.exports = Product;
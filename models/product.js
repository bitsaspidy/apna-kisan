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
        ref: 'ProductCategory', // Reference to ProductCategory model
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
    priceperquantity: { 
        type: Number, 
        required: true 
    },
    images: { 
        type: [String], 
        default: [] 
    },
    inventoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Inventory', 
    },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
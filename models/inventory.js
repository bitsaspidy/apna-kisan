const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    }, 
    quantity: { 
        type: Number, 
        required: true 
    },
    quantityunit: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['completed', 'ongoing', 'delivered'], 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    inventoryID: {
        type: Number,
        required: true
    }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
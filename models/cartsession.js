// models/CheckoutSession.js
const mongoose = require('mongoose');

const checkoutSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            productName: String,
            quantity: Number,
            price: Number,
            image: String
        }
    ],
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CheckoutSession', checkoutSessionSchema);

const mongoose = require('mongoose');

const productCartMetaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    cart_status: {
        type: Boolean,
        default: false
    },
    cart_quantity: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

productCartMetaSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('ProductCartMeta', productCartMetaSchema);

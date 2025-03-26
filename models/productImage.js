const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    productImageID: {
        type: Number,
        required: true
    },
    imageUrl: { 
        type: String, 
        required: true,
    },
}, { timestamps: true });

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
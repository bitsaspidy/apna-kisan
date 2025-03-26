const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
      },
      categoryID: {
        type: Number,
        required: true
      },
      image: { 
        type: String, 
        default: [] 
    },
}, { timestamps: true });

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema)

module.exports = ProductCategory;
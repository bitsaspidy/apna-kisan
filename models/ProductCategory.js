const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
      }
}, { timestamps: true });

const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderno: { type: String },
  invoiceno: { type: String },
  user: {
    fullName: String,
    mobile: String,
    address: String
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productID: Number,
      productName: String,
      quantity: Number,
      quantityunit: String,
      price: Number,
      image: String
    }
  ],
  totalAmount: Number,
  status: { type: String, default: 'ongoing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transcationID: {
    type: Number,
    required: true
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  recieverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  referenceNo: { 
    type: Number, 
    required: true 
},
  senderName: { 
    type: String, 
    required: true 
},
  transactionId: { 
    type: String, 
    required: true 
},
  amount: { 
    type: Number, 
    required: true 
},
  paymentMethod: { 
    type: String, 
    default: "UPI",
    required: true, 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction;
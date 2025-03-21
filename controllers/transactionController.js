const Transaction = require("../models/transaction");
import dbConnect from '../lib/mongodb';


async function handleAddTransactionDetail(req, res) {
  dbConnect();
    try {
        const { referenceNo, senderName, transactionId, amount, recieverId, paymentMethod } = req.body;
    
        const newTransaction = new Transaction({
          senderId: req.userId,
          recieverId,
          referenceNo,
          senderName,
          transactionId,
          amount,
          paymentMethod
        });
    
        await newTransaction.save();
        res.status(200).json({
          status: true, 
          message: "Transaction Added Successfully", 
          response: {
            newTransaction                 
          }
        });
      } catch (error) {
        res.status(200).json({
          status: false,
          message: "Server Error", 
          response: {                
            error
          }
        });
      }
};

async function handlereceiveTransactionDetail(req, res) {
  dbConnect();
    try {
        const transactions = await Transaction.find({ recieverId: req.userId }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No Transcation was found' });
        }

        res.status(200).json({
          status: true,
          response: {
            transactions                
          }
        });
      } catch (error) {
        res.status(200).json({
          status: false,
          message: "Server Error", 
          response: {
            error                 
          }
        });
      }
};

module.exports = {
    handleAddTransactionDetail,
    handlereceiveTransactionDetail,
};
const Transaction = require("../models/transcation");
const getNextSequence = require("../utils/counterService");
const moment = require('moment');


async function handleAddTranscationDetail(req, res) {
  try {
    const {senderName, transactionId, amount, recieverId, paymentMethod } = req.body;
    const nextReferenceNo = await getNextSequence('referenceno');
    const nextTranscationId = await getNextSequence('transcationID');

    const newTransaction = new Transaction({
      transcationID: nextTranscationId,
      senderId: req.userId,
      recieverId,
      referenceNo: nextReferenceNo,
      senderName,
      transactionId,
      amount,
      paymentMethod
    });

    
    await newTransaction.save();
    const transcationlist = {
      TransactionID: newTransaction.TransactionID,
      SenderID: newTransaction.senderID,
      RecieverId: newTransaction.recieverId,
      ReferenceNo: newTransaction.referenceNo,
      Amount: newTransaction.amount,
      PaymentMethod: newTransaction.paymentMethod,
      createdAt:  moment(newTransaction.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt:  moment(newTransaction.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    };

    res.status(200).json({
      status: true, 
      message: "Transaction Added Successfully", 
      response: {
        transcationlist                 
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

async function handlereceiveTranscationDetail(req, res) {
  try {
    const transaction = await Transaction.find({ recieverId: req.userId }).sort({ createdAt: -1 });

    if (transaction.length === 0) {
        return res.status(200).json({ message: 'No Transcation was found' });
    }
    const transcationlist = transaction.map(item => ({
      TransactionID: item.TransactionID,
      SenderID: item.senderID,
      RecieverId: item.recieverId,
      ReferenceNo: item.referenceNo,
      Amount: item.amount,
      PaymentMethod: item.paymentMethod,
      createdAt:  moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt:  moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
      
    }))

    res.status(200).json({
      status: true,
      message: "All messages",
      response: {
        transcationlist                
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
    handleAddTranscationDetail,
    handlereceiveTranscationDetail,
};
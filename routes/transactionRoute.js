const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const translateMiddleware = require("../middleware/translateMiddleware");
const { handleAddTransactionDetail, handlereceiveTransactionDetail } = require("../controllers/transactionController");

// Add a Transaction (Only Authenticated Users)
router.post("/add", authMiddleware, handleAddTransactionDetail);

// Get All Transactions of a User
router.get("/receive", authMiddleware, translateMiddleware, handlereceiveTransactionDetail);

module.exports = router;
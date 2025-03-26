const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const translateMiddleware = require("../middleware/translateMiddleware");
const { handleAddTranscationDetail, handlereceiveTranscationDetail } = require("../controllers/transcationController");

// Add a Transaction (Only Authenticated Users)
router.post("/add", authMiddleware, handleAddTranscationDetail);

// Get All Transactions of a User
router.get("/receive", authMiddleware, translateMiddleware, handlereceiveTranscationDetail);

module.exports = router;
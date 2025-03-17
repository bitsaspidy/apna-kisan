const express = require('express');
const router = express.Router();
const {getInventoryByStatus, updateInventory } = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:status', authMiddleware, getInventoryByStatus);
router.put('/update/:inventoryId', authMiddleware, updateInventory); 

module.exports = router;
const express = require('express');
const router = express.Router();
const {getInventoryByStatus, updateInventory } = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');

router.get('/:status', authMiddleware, translateMiddleware, getInventoryByStatus);
router.put('/update/:inventoryId', authMiddleware, updateInventory); 

module.exports = router;
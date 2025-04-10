const Inventory = require('../models/inventory');
const Product = require('../models/product');
const moment = require('moment');
const Order = require('../models/order');


async function getInventoryByStatus(req, res) {
    try {
      const { status } = req.params; // status = ongoing | current | complete
      const userId = req.userId;
  
      if (!['complete', 'ongoing', 'current'].includes(status)) {
        return res.status(200).json({
          status: false,
          message: 'Invalid inventory status',
          response: []
        });
      }
  
      const inventoryList = await Inventory.find({ status, userId }).populate({
        path: 'productId',
        populate: {
          path: 'categoryId',
          model: 'ProductCategory'
        }
      });
  
      if (!inventoryList.length) {
        return res.status(200).json({
          status: false,
          message: 'No inventory found for this status',
          response: []
        });
      }
  // Loop each inventory and find buyer
  const formatted = await Promise.all(
      inventoryList.map(async item => {
        const order = await Order.findOne({
          'items.productId': item.productId._id
        });
  
        const buyerName = order?.user?.fullName || 'Not Available';
  
        return {
          inventoryID: item.inventoryID,
          ProductName: item.productId?.productname,
          Category: item.productId?.categoryId?.name || 'Unknown Category',
          Price: item.productId?.priceperquantity,
          quantity: item.quantity,
          quantityunit: item.quantityunit,
          InventoryStatus: item.status,
          OrderedBy: buyerName, 
          createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        };
      })
    );
  
      res.status(200).json({
        status: true,
        message: `Inventory with status: ${status}`,
        response: formatted
      });
  
    } catch (error) {
      console.error('getInventoryByStatus error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error',
        response: error.message
      });
    }
  }
  
  async function updateInventory(req, res) {
      try {
        const userId = req.userId;
        const { inventoryID } = req.params;
        const { status } = req.body;
    
        if (!inventoryID) {
          return res.status(200).json({ status: false, message: 'inventoryID is required', response: [] });
        }
    
        const inventory = await Inventory.findOne({ inventoryID, userId });
        if (!inventory) {
          return res.status(200).json({ status: false, message: 'Inventory not found', response: [] });
        }
  
        if (status) inventory.status = status;
    
        await inventory.save();
    
        res.status(200).json({
          status: true,
          message: 'Inventory updated successfully',
          response: {
            inventoryID: inventory.inventoryID,
            status: inventory.status
          }
        });
    
      } catch (error) {
        console.error('updateInventory error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error',
          response: error.message
        });
      }
    }
    
  


module.exports = {getInventoryByStatus, updateInventory };
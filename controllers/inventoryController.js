const Inventory = require('../models/inventory');
const Product = require('../models/product');
import { response } from 'express';
import dbConnect from '../lib/mongodb';

async function getInventoryByStatus (req, res) {
    await dbConnect(); // ✅ dbConnect called
    try {
        const { status } = req.params;
        const loggedInUsers = req.userId;

        if (!['complete', 'ongoing', 'current'].includes(status)) {
            return res.status(200).json({ 
                status: false,
                message: 'Invalid inventory status',
                response: null
            });
        }

        const inventory = await Inventory.find({ status, userId: loggedInUsers }).populate('productId');
        const formattedInventory = inventory.map(item => ({
            ProductName: item.productId?.productname,
            Category: item.productId?.category,
            Price: item.productId?.priceperquantity
        }));

        res.status(200).json({
            status: true,
            message: `Inventory for ${status}`, 
            response: {
                Inventory: formattedInventory 
            },
        });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            status: false,
            message: 'Server error', 
            response: {
                error: error.message 
            }                
        });
    }
};

async function updateInventory(req, res) {
    await dbConnect(); // ✅ dbConnect called
    try {
        const { inventoryId } = req.params;
        const { quantity, status } = req.body;

        if (!inventoryId) {
            return res.status(200).json({
                status: false,
                message: 'Inventory ID is required'
            });
        }

        const inventory = await Inventory.findById(inventoryId);
        if (!inventory) {
            return res.status(200).json({
                status: false,
                message: 'Inventory not found'
            });
        }
        let quantityUpdated = false;

        if (quantity !== undefined && !isNaN(quantity)) {
            inventory.quantity = quantity;
            quantityUpdated = true; 
        }

        if (status !== undefined) {
            inventory.status = status;
        }

        const updatedInventory = await inventory.save();
        if (quantityUpdated) {
            const product = await Product.findById(inventory.productId);

            if (product) {
                product.quantity = quantity;
                await product.save();
                console.log(`Product quantity synced with inventory quantity: ${quantity}`);
            } else {
                console.warn(`No product found for inventory productId: ${inventory.productId}`);
            }
        }

        res.status(200).json({
            status: true,
            message: 'Inventory updated successfully',
            response: {
                inventory: updatedInventory
            }
        });

    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(200).json({
            status: false,
            message: 'Server error while updating inventory',
            response: {                
                error: error.message
            }
        });
    }
}


module.exports = {getInventoryByStatus, updateInventory };
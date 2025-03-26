const Inventory = require('../models/inventory');
const Product = require('../models/product');
const moment = require('moment');


async function getInventoryByStatus (req, res) {
    try {
        const { status } = req.params;
        const loggedInUserId = req.userId;

        if (!['complete', 'ongoing', 'current'].includes(status)) {
            return res.status(200).json({ 
                status: false,
                message: 'Invalid inventory status',
                response: null
             });
        }

        const inventory = await Inventory.find({ status, userId: loggedInUserId }).populate({
            path: 'productId',
            populate: {
                path: 'categoryId', // This must match your Product schema ref field
                model: 'ProductCategory' // Explicitly mention model if necessary
            }
        });;

        const formattedInventory = inventory.map(item => ({
                ProductName: item.productId?.productname,
                Category: item.productId?.categoryId?.name || 'Unknown Category',
                Price: item.productId?.priceperquantity,
                quantity: item.quantity,
                quantityunit: item.quantityUnit,
                InventoryStatus: item.status,
                InventoryID: item.inventoryID,
                createdAt:  moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt:  moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
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
        res.status(500).json({ 
            status: false,
            message: 'Server error', 
            response: {
                error: error.message 
            } 
         });
    }
};

async function updateInventory(req, res) {
    try {
        const { inventoryId } = req.params;
        const { quantity, status, quantityUnit } = req.body;

        if (!inventoryId) {
            return res.status(200).json({
                status: false,
                message: 'Inventory ID is required',
                response: null
            });
        }

        const inventory = await Inventory.findOne({inventoryID: inventoryId});
        if (!inventory) {
            return res.status(200).json({
                status: false,
                message: 'Inventory not found',
                response: null
            });
        }
        let quantityUpdated = false;
        let quantityUnitUpdated = false;

        if (quantity !== undefined && !isNaN(quantity)) {
            inventory.quantity = quantity;
            quantityUpdated = true; 
        }
        if (quantityUnit !== undefined && quantityUnit !== '') {
            inventory.quantityUnit = quantityUnit;
            quantityUnitUpdated = true; 
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
        if (quantityUnitUpdated) {
            const product = await Product.findById(inventory.productId);

            if (product) {
                product.quantityUnit = quantityUnit;
                await product.save();
                console.log(`Product quantityUnit synced with inventory quantityUnit: ${quantityUnit}`);
            } else {
                console.warn(`No product found for inventory productId: ${inventory.productId}`);
            }
        }

        res.status(200).json({
            status: true,
            message: 'Inventory updated successfully',
            inventory: updatedInventory
        });

    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({
            status: false,
            message: 'Server error while updating inventory',
            error: error.message
        });
    }
}


module.exports = {getInventoryByStatus, updateInventory };
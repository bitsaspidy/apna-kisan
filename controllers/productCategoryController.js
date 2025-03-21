const ProductCategory = require("../models/ProductCategory");
import dbConnect from '../lib/mongodb';

async function handleAddNewProductCategory(req, res) {
    await dbConnect();
    const {name} = req.body;

    if ( !name ) {
        return res.status(400).json({status: "error", message: "Please fill Category Name"});
    }

    try {
        const category = ProductCategory({
            name,
        });

        await category.save();
        res.status(200).json({status: true, message: 'Category added successfully', category });
    } catch (err) {
        res.status(500).json({status: false, message: 'Error adding Category', error: err.message });
    }
};

async function handleGetAllCategory(req, res) {
    await dbConnect();
    try {
        const categorys = await ProductCategory.find();
        if (categorys.length === 0) {
            return res.status(404).json({ message: 'No Transcation was found' });
        }

        res.status(200).json(categorys);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

async function handleDeleteProductCategory (req, res) {
    await dbConnect();
    const { categoryId } = req.params;

    try {
        const category = await ProductCategory.findOneAndDelete({ _id: categoryId });
        if (!category) return res.status(404).json({ message: 'category not found' });
        res.status(200).json({ message: 'category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting category', error: err.message });
    }
};

async function handleUpdateProductCategory(req, res) {
    await dbConnect();
    const { categoryId } = req.params;
    const {
        name
    } = req.body;

    if (!categoryId) {
        return res.status(400).json({ status: false, message: 'categoryId ID is required' });
    }

    try {
        const category = await ProductCategory.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: false, message: 'Category not found' });
        }

        if (name) category.name = name;
        await category.save();

        res.status(200).json({
            status: true,
            message: 'category updated successfully',
            category
        });

    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({
            status: false,
            message: 'Error updating category',
            error: err.message
        });
    }
}

module.exports = {
    handleAddNewProductCategory,
    handleGetAllCategory,
    handleDeleteProductCategory,
    handleUpdateProductCategory
}
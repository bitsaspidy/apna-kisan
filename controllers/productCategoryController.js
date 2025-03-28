const fs = require('fs');
const path = require('path');
const ProductCategory = require("../models/productCategory");
const getNextSequence = require("../utils/counterService");
const moment = require('moment');

const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, '/');
};


async function handleAddNewProductCategory(req, res) {
    const {name} = req.body;

    const imageFiles = req.files?.filter(file => file.fieldname === 'image') || [];

    // ✅ If more than 1 image uploaded, return error
    if (imageFiles.length > 1) {
        // Delete all uploaded files to avoid leaving junk on disk
        imageFiles.forEach(file => {
            fs.unlink(path.resolve(file.path), (err) => {
                if (err) console.error('Error cleaning up file:', err);
            });
        });

        return res.status(200).json({
            status: false,
            message: 'Only one image is allowed!',
            response: null
        });
    }

    const imagePath = imageFiles[0] ? normalizePath(imageFiles[0].path) : null;

    if ( !name ) {
        return res.status(200).json({status: false, message: "Please fill Category Name", response: null});
    }

    try {
        const nextCategoryId = await getNextSequence('categoryid');
        const category = ProductCategory({
            name,
            categoryID: nextCategoryId,
            image: imagePath,
        });

        const categoryList = [{

            categoryName: category.name,
            categoryId: category.categoryID,
            image: category.image,
            createdAt:  moment(category.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(category.updatedAt).format('YYYY-MM-DD HH:mm:ss')

        }];

        await category.save();
        res.status(200).json({
            status: true, 
            message: 'Category added successfully', 
            response: {
                categoryList
            } 
        });
    } catch (err) {
        res.status(500).json({status: false, message: 'Error adding Category', response: {error: err.message} });
    }
};


async function handleGetAllCategory(req, res) {
    try {
        const category = await ProductCategory.find();
        if (category.length === 0) {
            return res.status(200).json({status: false, message: 'No Category was found', response: null });
        }

            const categoryList = await category.map( item => ({

                    categoryName: item.name,
                    categoryId: item.categoryID,
                    image: item.image ? item.image : 'no images' ,
                    createdAt:  moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                    updatedAt:  moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')

            }))

        res.status(200).json({
            status: true, 
            message: 'Category listed successfully', 
            response: {
                categoryList
            }
        });

    } catch (error) {
        res.status(500).json({status: false, message: 'Server error', response: {error: error.message} });
    }
};

async function handleDeleteProductCategory (req, res) {
    const { categoryId } = req.params;

    try {
        const category = await ProductCategory.findOneAndDelete({categoryID: categoryId });
        if (!category) return res.status(200).json({ staus: false, message: 'category not found', response: null });
        res.status(200).json({staus: true, message: 'category deleted successfully', response: null });
    } catch (err) {
        res.status(500).json({status: false, message: 'Error deleting category', response: {error: err.message} });
    }
};


async function handleUpdateProductCategory(req, res) {
    const { categoryId } = req.params;
    const { name } = req.body;

    const imageFiles = req.files?.filter(file => file.fieldname === 'image') || [];

    // ✅ If more than 1 image uploaded, return error
    if (imageFiles.length > 1) {
        return res.status(200).json({
            status: false,
            message: 'Only one image is allowed!',
            response: null
        });
    }

    const newImagePath = imageFiles[0] ? normalizePath(imageFiles[0].path) : null;

    if (!categoryId) {
        return res.status(200).json({ status: false, message: 'categoryId ID is required' , response: null});
    }

    try {
        const category = await ProductCategory.findOne({categoryID: categoryId});     

        if (!category) {
            return res.status(200).json({ status: false, message: 'Category not found' , response: null});
        }

        if (newImagePath) {
            const oldImagePath = category.image;

            if (oldImagePath) {
                const absoluteOldPath = path.resolve(oldImagePath);
                fs.unlink(absoluteOldPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete old image: ${absoluteOldPath}`, err);
                    } else {
                        console.log(`Old image deleted: ${absoluteOldPath}`);
                    }
                });
            }
            category.image = newImagePath;
        }

        if (name) category.name = name;
        await category.save();

        const categoryList = [{
            categoryName: category.name,
            categoryId: category.categoryID,
            image: category.image,
            createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm:ss')

        }];

        res.status(200).json({
            status: true,
            message: 'category updated successfully',
            Response: {
                categoryList
            }
        });

    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({
            status: false,
            message: 'Error updating category',
            response: {
                error: err.message
            }
        });
    }
}

module.exports = {
    handleAddNewProductCategory,
    handleGetAllCategory,
    handleDeleteProductCategory,
    handleUpdateProductCategory,
}
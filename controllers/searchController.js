const Product = require('../models/product'); // adjust the path if needed
const ProductCategory = require('../models/productCategory');

const searchProduct = async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(200).json({ message: 'Please provide a search query.' });
    }

    try {
        const searchRegex = new RegExp(searchQuery, 'i'); // case-insensitive

        const matchingCategories = await ProductCategory.find({ name: searchRegex });
        const matchingCategoryIds = matchingCategories.map(cat => cat._id);

        let query = {
            $or: [
                { productname: searchRegex },
                { categoryId: { $in: matchingCategoryIds } },
                { description: searchRegex }
            ]
        };

        if (!isNaN(searchQuery)) {
            query.$or.push({ quantity: Number(searchQuery) });
            query.$or.push({ priceperquantity: Number(searchQuery) });
        }

        const results = await Product.find(query).populate('categoryId', 'name');

        if (results.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'No result was found.',
                response: null,
             });
        }

        const formattedResults = results.map(product => ({
            ProductName: product.productname,
            Category: product.categoryId ? product.categoryId.name : 'Unknown',
            Description: product.description,
            Price: product.priceperquantity
        }));

        res.status(200).json({
            status: true,
            message: 'Search successful',
            response: {
                totalResults: formattedResults.length,
                result: formattedResults
            }
        });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error',
            response: null,
            error: error,
            errormessage: error.message
        });
    }
};

module.exports = { searchProduct };

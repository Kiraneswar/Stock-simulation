const Stock = require('../models/Stock');

// @desc Get all stocks
// @route GET /api/stocks
const getStocks = async (req, res) => {
    try {
        const stocks = await Stock.find({});
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get stock by id
// @route GET /api/stocks/:id
const getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (stock) {
            res.json(stock);
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStocks, getStockById };

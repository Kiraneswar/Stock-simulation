const Stock = require('../models/Stock');

const getStocks = async (req, res) => {
    try {
        const stocks = await Stock.find({});
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

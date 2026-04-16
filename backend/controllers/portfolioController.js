const Portfolio = require('../models/Portfolio');

// @desc Get user portfolio
// @route GET /api/portfolio
const getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user._id }).populate('holdings.stockId');
        if (portfolio) {
            res.json(portfolio);
        } else {
            // New user, return empty skeleton instead of 404 to satisfy frontend
            res.json({ userId: req.user._id, holdings: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPortfolio };

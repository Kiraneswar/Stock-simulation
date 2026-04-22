const Portfolio = require('../models/Portfolio');

const getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user._id }).populate('holdings.stockId');
        if (portfolio) {
            res.json(portfolio);
        } else {
            res.json({ userId: req.user._id, holdings: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPortfolio };

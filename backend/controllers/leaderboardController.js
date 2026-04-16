const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Stock = require('../models/Stock');

// @desc Get leaderboard based on total portfolio value + balance
// @route GET /api/leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({}).populate('holdings.stockId');
        const users = await User.find({}).select('name balance');
        const stocks = await Stock.find({}); // Get current prices

        // Calculate total worth for each user
        const leaderboard = users.map(user => {
            const userPort = portfolios.find(p => p.userId.toString() === user._id.toString());
            let portfolioValue = 0;
            
            if (userPort) {
                userPort.holdings.forEach(h => {
                    if (h.stockId) {
                        const stock = stocks.find(s => s._id.toString() === (h.stockId._id || h.stockId).toString());
                        const currentPrice = stock ? stock.currentPrice : h.averagePrice;
                        portfolioValue += currentPrice * h.quantity;
                    }
                });
            }

            const totalWorth = user.balance + portfolioValue;
            const profit = totalWorth - 1000000; // Starting balance assumed 1,000,000 (10 Lakhs)

            return {
                _id: user._id,
                name: user.name,
                balance: user.balance,
                portfolioValue,
                totalWorth,
                profit
            };
        });

        leaderboard.sort((a, b) => b.totalWorth - a.totalWorth);
        res.json(leaderboard.slice(0, 10)); // Top 10 users
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboard };

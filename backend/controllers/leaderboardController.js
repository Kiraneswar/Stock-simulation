const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Stock = require('../models/Stock');


const getLeaderboard = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({}).populate('holdings.stockId');
        const users = await User.find({}).select('name balance');
        const stocks = await Stock.find({});

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
            const profit = totalWorth - 1000000;
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

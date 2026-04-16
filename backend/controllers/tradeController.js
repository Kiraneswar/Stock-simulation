const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @desc Buy stock
// @route POST /api/trade/buy
const buyStock = async (req, res) => {
    const { stockId, quantity } = req.body;
    try {
        const stock = await Stock.findById(stockId);
        const user = await User.findById(req.user._id);

        if (!stock) return res.status(404).json({ message: 'Stock not found' });
        if (quantity <= 0) return res.status(400).json({ message: 'Invalid quantity' });

        const cost = stock.currentPrice * quantity;
        if (user.balance < cost) return res.status(400).json({ message: 'Insufficient balance' });

        // Deduct balance
        user.balance -= cost;
        await user.save();

        // Add Transaction
        await Transaction.create({
            userId: user._id, stockId, type: 'buy', quantity, price: stock.currentPrice
        });

        // Update Portfolio - Ensure creation if missing
        let portfolio = await Portfolio.findOne({ userId: user._id });
        if (!portfolio) {
            portfolio = await Portfolio.create({ userId: user._id, holdings: [] });
        }
        
        const existingStock = portfolio.holdings.find(h => h.stockId.toString() === stockId);

        if (existingStock) {
            const totalCostBefore = existingStock.quantity * existingStock.averagePrice;
            const newTotalCost = totalCostBefore + cost;
            existingStock.quantity += Number(quantity);
            existingStock.averagePrice = newTotalCost / existingStock.quantity;
        } else {
            portfolio.holdings.push({ stockId, quantity, averagePrice: stock.currentPrice });
        }
        await portfolio.save();

        res.json({ message: 'Stock bought successfully', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Sell stock
// @route POST /api/trade/sell
const sellStock = async (req, res) => {
    const { stockId, quantity } = req.body;
    try {
        const stock = await Stock.findById(stockId);
        const user = await User.findById(req.user._id);

        if (!stock) return res.status(404).json({ message: 'Stock not found' });
        if (quantity <= 0) return res.status(400).json({ message: 'Invalid quantity' });

        let portfolio = await Portfolio.findOne({ userId: user._id });
        if (!portfolio) {
            portfolio = await Portfolio.create({ userId: user._id, holdings: [] });
        }
        
        const existingStock = portfolio.holdings.find(h => h.stockId.toString() === stockId);

        if (!existingStock || existingStock.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock quantity' });
        }

        const revenue = stock.currentPrice * quantity;

        // Add balance
        user.balance += revenue;
        await user.save();

        // Add Transaction
        await Transaction.create({
            userId: user._id, stockId, type: 'sell', quantity, price: stock.currentPrice
        });

        // Update Portfolio
        existingStock.quantity -= quantity;
        if (existingStock.quantity === 0) {
            portfolio.holdings = portfolio.holdings.filter(h => h.stockId.toString() !== stockId);
        }
        await portfolio.save();

        res.json({ message: 'Stock sold successfully', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { buyStock, sellStock };

const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    holdings: [{
        stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
        quantity: { type: Number, default: 0 },
        averagePrice: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);

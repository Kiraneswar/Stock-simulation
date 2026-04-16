const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    previousPrice: { type: Number, required: true }, // To calculate % change
    history: [{
        price: Number,
        timestamp: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Stock', StockSchema);

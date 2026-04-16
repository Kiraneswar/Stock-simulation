const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 1000000 }, // Start with ₹1,000,000 virtual money
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

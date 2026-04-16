const express = require('express');
const router = express.Router();
const { getStocks, getStockById } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStocks);
router.get('/:id', protect, getStockById);

module.exports = router;

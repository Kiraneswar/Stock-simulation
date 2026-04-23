const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const socketService = require('./services/socketService');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/trade', require('./routes/tradeRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

socketService.init(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

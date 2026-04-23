const { Server } = require('socket.io');
const Stock = require('../models/Stock');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });

    startMarketSimulation();
};

const nifty200Stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', currentPrice: 2850.50 },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', currentPrice: 3820.25 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', currentPrice: 1450.15 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', currentPrice: 1080.45 },
    { symbol: 'INFY', name: 'Infosys Ltd.', currentPrice: 1540.30 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', currentPrice: 2420.10 },
    { symbol: 'ITC', name: 'ITC Ltd.', currentPrice: 430.75 },
    { symbol: 'SBIN', name: 'State Bank of India', currentPrice: 750.40 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', currentPrice: 1210.60 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', currentPrice: 6650.00 },
    { symbol: 'LTIM', name: 'LTIMindtree Ltd.', currentPrice: 5120.20 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', currentPrice: 1720.50 },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', currentPrice: 1050.25 },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd.', currentPrice: 3550.80 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', currentPrice: 1470.15 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', currentPrice: 2850.40 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', currentPrice: 11500.00 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', currentPrice: 1540.20 },
    { symbol: 'TITAN', name: 'Titan Company Ltd.', currentPrice: 3620.10 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', currentPrice: 9800.00 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', currentPrice: 140.25 },
    { symbol: 'NTPC', name: 'NTPC Ltd.', currentPrice: 340.50 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', currentPrice: 1920.30 },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', currentPrice: 280.15 },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', currentPrice: 3120.45 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', currentPrice: 850.10 },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', currentPrice: 1480.20 },
    { symbol: 'COALINDIA', name: 'Coal India Ltd.', currentPrice: 440.60 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', currentPrice: 1320.15 },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', currentPrice: 2240.25 },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', currentPrice: 8350.10 },
    { symbol: 'WIPRO', name: 'Wipro Ltd.', currentPrice: 480.40 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', currentPrice: 270.50 },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', currentPrice: 1250.20 },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', currentPrice: 580.15 },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', currentPrice: 1480.30 },
    { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', currentPrice: 4950.40 },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', currentPrice: 2520.10 },
    { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Ltd.', currentPrice: 6250.15 },
    { symbol: 'CIPLA', name: 'Cipla Ltd.', currentPrice: 1480.25 },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', currentPrice: 4520.40 },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', currentPrice: 3950.10 },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', currentPrice: 610.20 },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', currentPrice: 1610.30 },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', currentPrice: 6350.20 },
    { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd.', currentPrice: 3740.15 },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', currentPrice: 1120.30 },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd.', currentPrice: 25800.00 },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.', currentPrice: 620.10 },
    { symbol: 'LICI', name: 'Life Insurance Corporation of India', currentPrice: 940.50 },
    { symbol: 'ABBOTINDIA', name: 'Abbott India Ltd.', currentPrice: 26500.00 },
    { symbol: 'ADANIENSOL', name: 'Adani Energy Solutions Ltd.', currentPrice: 1040.80 },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', currentPrice: 1850.20 },
    { symbol: 'ADANIPOWER', name: 'Adani Power Ltd.', currentPrice: 580.45 },
    { symbol: 'ATGL', name: 'Adani Total Gas Ltd.', currentPrice: 945.30 },
    { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd.', currentPrice: 5120.50 },
    { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd.', currentPrice: 620.40 },
    { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd.', currentPrice: 1080.15 },
    { symbol: 'DMART', name: 'Avenue Supermarts Ltd.', currentPrice: 4250.60 },
    { symbol: 'BAJAJHLDNG', name: 'Bajaj Holdings & Investment Ltd.', currentPrice: 8450.00 },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', currentPrice: 275.40 },
    { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd.', currentPrice: 560.15 },
    { symbol: 'BEL', name: 'Bharat Electronics Ltd.', currentPrice: 210.45 },
    { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', currentPrice: 245.30 },
    { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment & Finance', currentPrice: 1210.20 },
    { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Ltd.', currentPrice: 2650.45 },
    { symbol: 'DLF', name: 'DLF Ltd.', currentPrice: 890.10 },
    { symbol: 'GAIL', name: 'GAIL (India) Ltd.', currentPrice: 185.40 },
    { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', currentPrice: 3250.50 },
    { symbol: 'HAVELLS', name: 'Havells India Ltd.', currentPrice: 1540.20 },
    { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance', currentPrice: 1650.30 },
    { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance', currentPrice: 610.45 },
    { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', currentPrice: 175.20 },
    { symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism', currentPrice: 945.60 },
    { symbol: 'IRFC', name: 'Indian Railway Finance Corporation', currentPrice: 145.30 },
    { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', currentPrice: 3250.15 },
    { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd.', currentPrice: 845.20 },
    { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', currentPrice: 350.45 },
    { symbol: 'LUPIN', name: 'Lupin Ltd.', currentPrice: 1620.40 },
    { symbol: 'MARICO', name: 'Marico Ltd.', currentPrice: 512.30 },
    { symbol: 'MPHASIS', name: 'Mphasis Ltd.', currentPrice: 2450.60 },
    { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd.', currentPrice: 1450.20 },
    { symbol: 'NMDC', name: 'NMDC Ltd.', currentPrice: 235.15 },
    { symbol: 'PIIND', name: 'PI Industries Ltd.', currentPrice: 3650.40 },
    { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', currentPrice: 2850.50 },
    { symbol: 'PNB', name: 'Punjab National Bank', currentPrice: 125.40 },
    { symbol: 'RECLTD', name: 'REC Ltd.', currentPrice: 480.15 },
    { symbol: 'SIEMENS', name: 'Siemens Ltd.', currentPrice: 5120.45 },
    { symbol: 'SRF', name: 'SRF Ltd.', currentPrice: 2450.10 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', currentPrice: 980.45 },
    { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd.', currentPrice: 7650.20 },
    { symbol: 'TATACOMM', name: 'Tata Communications Ltd.', currentPrice: 1850.30 },
    { symbol: 'TRENT', name: 'Trent Ltd.', currentPrice: 4120.50 },
    { symbol: 'TVSHLTD', name: 'TVS Holdings Ltd.', currentPrice: 8450.10 },
    { symbol: 'UNITDSPR', name: 'United Spirits Ltd.', currentPrice: 1120.20 },
    { symbol: 'VBL', name: 'Varun Beverages Ltd.', currentPrice: 1450.60 },
    { symbol: 'VEDL', name: 'Vedanta Ltd.', currentPrice: 275.30 },
    { symbol: 'YESBANK', name: 'Yes Bank Ltd.', currentPrice: 24.15 },
    { symbol: 'ZOMATO', name: 'Zomato Ltd.', currentPrice: 185.45 },

    { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd.', currentPrice: 160.40 },
    { symbol: 'PAYTM', name: 'One 97 Communications Ltd.', currentPrice: 420.15 },
    { symbol: 'DELHIVERY', name: 'Delhivery Ltd.', currentPrice: 450.30 },
    { symbol: 'LICI', name: 'Life Insurance Corporation of India', currentPrice: 940.50 },
    { symbol: 'AWL', name: 'Adani Wilmar Ltd.', currentPrice: 350.20 },
    { symbol: 'SUZLON', name: 'Suzlon Energy Ltd.', currentPrice: 40.15 },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', currentPrice: 80.45 },
    { symbol: 'PNB', name: 'Punjab National Bank', currentPrice: 125.40 },
    { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', currentPrice: 350.45 },
    { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd.', currentPrice: 250.20 },
    { symbol: 'IRCON', name: 'Ircon International Ltd.', currentPrice: 220.10 },
    { symbol: 'IREDA', name: 'Indian Renewable Energy Dev Agency', currentPrice: 170.50 },
    { symbol: 'BSE', name: 'BSE Ltd.', currentPrice: 2450.30 },
    { symbol: 'MCX', name: 'Multi Commodity Exchange of India', currentPrice: 3650.15 },
    { symbol: 'CDSL', name: 'Central Depository Services Ltd.', currentPrice: 1850.40 },
    { symbol: 'ANGELONE', name: 'Angel One Ltd.', currentPrice: 2850.25 },
    { symbol: 'IDEA', name: 'Vodafone Idea Ltd.', currentPrice: 14.15 },
    { symbol: 'YESBANK', name: 'Yes Bank Ltd.', currentPrice: 24.15 },
    { symbol: 'SUVENPHAR', name: 'Suven Pharmaceuticals Ltd.', currentPrice: 720.50 },
    { symbol: 'GLAND', name: 'Gland Pharma Ltd.', currentPrice: 1850.40 },
    { symbol: 'LAURUSLABS', name: 'Laurus Labs Ltd.', currentPrice: 410.20 },
    { symbol: 'BIOCON', name: 'Biocon Ltd.', currentPrice: 280.15 },
    { symbol: 'AUFILIA', name: 'AU Small Finance Bank Ltd.', currentPrice: 620.40 },
    { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd.', currentPrice: 190.25 },
    { symbol: 'CUB', name: 'City Union Bank Ltd.', currentPrice: 140.10 },
    { symbol: 'KARURVYSYA', name: 'Karur Vysya Bank Ltd.', currentPrice: 180.30 },
    { symbol: 'MAHABANK', name: 'Bank of Maharashtra', currentPrice: 60.45 },
    { symbol: 'IOB', name: 'Indian Overseas Bank', currentPrice: 65.20 },
    { symbol: 'UCOBANK', name: 'UCO Bank', currentPrice: 55.15 },
    { symbol: 'SOUTHBANK', name: 'South Indian Bank Ltd.', currentPrice: 35.40 },
    { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd.', currentPrice: 155.10 },
    { symbol: 'RBLBANK', name: 'RBL Bank Ltd.', currentPrice: 240.25 },
    { symbol: 'CAMS', name: 'Computer Age Management Services', currentPrice: 2850.40 },
    { symbol: 'HDFCAMC', name: 'HDFC Asset Management Co Ltd.', currentPrice: 3750.20 }
];

const seedStocks = async () => {
    try {
        await Stock.deleteMany({});
        const Portfolio = require('../models/Portfolio');
        const Transaction = require('../models/Transaction');
        await Portfolio.deleteMany({});
        await Transaction.deleteMany({});

        const mapped = nifty200Stocks.map(s => ({
            ...s,
            previousPrice: s.currentPrice,
            history: Array.from({ length: 20 }, (_, i) => ({
                price: s.currentPrice + (Math.random() * 20 - 10),
                timestamp: new Date(Date.now() - (20 - i) * 2000)
            }))
        }));
        await Stock.insertMany(mapped);
        console.log(`${nifty200Stocks.length} Indian Stocks seeded successfully.`);

        // Seed Bot Users
        const User = require('../models/User');
        const bots = [
            { name: 'Institutional Alpha Bot', email: 'bot1@obsidian.com', password: 'hashed_password', balance: 1250000 },
            { name: 'Momentum Scalper', email: 'bot2@obsidian.com', password: 'hashed_password', balance: 980000 },
            { name: 'Arbitrage Node 01', email: 'bot3@obsidian.com', password: 'hashed_password', balance: 1100000 },
            { name: 'HFT Liquidity Provider', email: 'bot4@obsidian.com', password: 'hashed_password', balance: 5000000 },
            { name: 'Retain Value Bot', email: 'bot5@obsidian.com', password: 'hashed_password', balance: 850000 }
        ];

        for (const botData of bots) {
            let bot = await User.findOne({ email: botData.email });
            if (!bot) {
                bot = await User.create(botData);
            }

            // Create initial holdings for bots to make leaderboard dynamic
            let botPort = await Portfolio.findOne({ userId: bot._id });
            if (!botPort) {
                const randomStocks = await Stock.find().limit(5);
                const holdings = randomStocks.map(s => ({
                    stockId: s._id,
                    quantity: Math.floor(Math.random() * 100) + 10,
                    averagePrice: s.currentPrice
                }));
                await Portfolio.create({ userId: bot._id, holdings });
            }
        }

    } catch (e) {
        console.error("Seed error:", e.message);
    }
}

const startMarketSimulation = async () => {
    await seedStocks();

    setInterval(async () => {
        try {
            const stocks = await Stock.find({});
            if (!stocks.length) return;

            const updatedStocks = [];

            for (let stock of stocks) {
                const volatility = 0.005;
                const changePercent = (Math.random() * volatility * 2) - volatility;

                stock.previousPrice = stock.currentPrice;
                let newPrice = stock.currentPrice * (1 + changePercent);
                if (newPrice < 1) newPrice = 1;

                stock.currentPrice = parseFloat(newPrice.toFixed(2));

                stock.history.push({ price: stock.currentPrice, timestamp: new Date() });
                if (stock.history.length > 50) stock.history.shift();

                await stock.save();
                updatedStocks.push(stock);
            }

            if (io) io.emit('market-update', updatedStocks);
        } catch (error) {
            console.error("Simulation error:", error.message);
        }
    }, 2000);
};

module.exports = { init };

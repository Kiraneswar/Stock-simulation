const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            console.log(`MongoDB Connected (Local): ${mongoose.connection.host}`);
            return;
        } catch (localError) {
            console.log("Local MongoDB not available. Starting In-Memory DB...");
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

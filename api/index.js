const serverless = require('serverless-http');
const app = require('../app');
const { connectToMongoDB } = require('../config');

let serverlessHandler;
let connectionPromise;

module.exports = async (req, res) => {
    try {
        // Establish MongoDB connection ONCE per cold start
        if (!connectionPromise) {
            console.log('Connecting to MongoDB...');
            connectionPromise = connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp");
            
            // ✅ Confirm the connection was successful
            await connectionPromise;
            console.log('✅ MongoDB connected successfully!');
        } else {
            console.log('✅ Reusing existing MongoDB connection.');
        }

        // Initialize serverless handler ONCE per cold start
        if (!serverlessHandler) {
            console.log('Initializing serverless handler...');
            serverlessHandler = serverless(app);
        }

        return serverlessHandler(req, res);

    } catch (error) {
        console.error('❌ Handler error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

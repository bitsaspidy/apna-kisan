const serverless = require('serverless-http');
const app = require('../app');
const { connectToMongoDB } = require('../config');

let serverlessHandler;
let connectionPromise;

module.exports = async (req, res) => {
    try {
        if (!connectionPromise) {
            console.log('Connecting to MongoDB...');
            connectionPromise = connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp");
        }

        await connectionPromise;

        if (!serverlessHandler) {
            serverlessHandler = serverless(app);
        }

        return serverlessHandler(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

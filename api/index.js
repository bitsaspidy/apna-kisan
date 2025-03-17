const serverless = require('serverless-http');
const app = require('../app');
const { connectToMongoDB } = require('../config');

let serverlessHandler;

module.exports = async (req, res) => {
    try {
        await connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp"); // ✅ Using env var

        if (!serverlessHandler) {
            serverlessHandler = serverless(app);
        }

        return serverlessHandler(req, res);
    } catch (error) {
        console.error('❌ Error in handler:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const serverless = require('serverless-http');
const app = require('../app');
const { connectToMongoDB } = require('../config');

let connectionPromise;

async function connect() {
  if (!connectionPromise) {
    console.log('Connecting to MongoDB...');
    connectionPromise = connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp");
    await connectionPromise;
    console.log('✅ MongoDB connected successfully!');
  }
}

connect(); // Kick-off immediately at cold start!

module.exports = serverless(app, {
  callbackWaitsForEmptyEventLoop: false
});

const mongoose = require('mongoose');

let isConnected = false; // Global connection cache

async function connectToMongoDB(uri) {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        await mongoose.connect(uri);

        isConnected = true;
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { connectToMongoDB };

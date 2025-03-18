const mongoose = require('mongoose');

let isConnected = false;

async function connectToMongoDB(uri) {
    if (isConnected) {
        console.log('✅ Using cached MongoDB connection');
        return;
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { connectToMongoDB };

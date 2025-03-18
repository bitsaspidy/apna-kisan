const mongoose = require('mongoose');

let isConnected = false;

async function connectToMongoDB(uri) {
  if (isConnected) {
    console.log('✅ Using cached MongoDB connection');
    return;
  }

  try {
    console.log('🛠️ Connecting to MongoDB...');
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    
    if (isConnected) {
      console.log('✅ MongoDB connected successfully!');
    } else {
      console.error('❌ MongoDB failed to connect');
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToMongoDB };

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notificationID: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
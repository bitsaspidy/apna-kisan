const Notification = require('../models/notification');

// Send notification
async function handleSendNotification(req, res){
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({status: "error", message: 'All fields are required!' });
        }

        const newNotification = new Notification({ userId, title, message });
        await newNotification.save();

        res.status(200).json({status: true, message: 'Notification sent!', notification: newNotification });

    } catch (error) {
        res.status(500).json({status: "error", message: 'Server error', error: error.message });
    }
};

// Get notifications for a user
async function handleGetUserNotifications (req, res){
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({status: true, notifications});

    } catch (error) {
        res.status(500).json({status: "error", message: 'Server error', error: error.message });
    }
};

module.exports = { handleSendNotification, handleGetUserNotifications };
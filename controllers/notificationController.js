const Notification = require('../models/notification');
const getNextSequence = require("../utils/counterService");


// Send notification
async function handleSendNotification(req, res){
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(200).json({status: false, message: 'All fields are required!', response: null });
        }
        const nextNotificationId = await getNextSequence('notificationID');

        const newNotification = new Notification({ 
            userId, 
            title, 
            message,
            notificationID: nextNotificationId, 
        });
        await newNotification.save();

        res.status(200).json({
            status: true, 
            message: 'Notification sent!', 
            response: {
            notification: newNotification                 
            }  
        });

    } catch (error) {
        res.status(500).json({
            status: false, 
            message: 'Server error', 
            response: {                
                error: error.message 
            }
        });
    }
};

// Get notifications for a user
async function handleGetUserNotifications (req, res){
    try {   
        const notifications = await Notification.find({ userId: req.userId });
        res.status(200).json({
            status: true,
            message: "all notifications",
            response: {
                notifications                
            }
        });
    } catch (error) {
        res.status(200).json({
            status: false,
            message: 'Server error', 
            response: {                
                error: error.message 
            }
        });
    }
};

module.exports = { handleSendNotification, handleGetUserNotifications };
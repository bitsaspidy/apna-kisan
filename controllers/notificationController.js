const Notification = require('../models/notification');
const getNextSequence = require("../utils/counterService");
const moment = require('moment');


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

        const formatedlist = [{
            notificationID : newNotification.notificationID,
            userId : newNotification.userId,
            title: newNotification.title,
            message: newNotification.message,
            createdAt:  moment(newNotification.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt:  moment(newNotification.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        }]
        await newNotification.save();

        res.status(200).json({
            status: true, 
            message: 'Notification sent!', 
            response: formatedlist                 
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
        const notification = await Notification.find({ userId: req.userId });
        if(!notification.length){
            return res.status(200).json({
                status: true,
                message: `No Notifications`,
                Response: []
            });
        }

        const formatedlist = await notification.map(item => ({
                notificationID : item.notificationID,
                userId : item.userId,
                title: item.title,
                message: item.message,
                createdAt:  moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt:  moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        }))
        res.status(200).json({
            status: true,
            message: "all notifications",
            response: formatedlist                
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

module.exports = { handleSendNotification, handleGetUserNotifications };
const Notification = require('../models/notification');
import { response } from 'express';
import dbConnect from '../lib/mongodb';

// Send notification
async function handleSendNotification(req, res){
    await dbConnect(); // ✅ dbConnect called
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(200).json({
                status: false, 
                message: 'All fields are required!' 
            });
        }

        const newNotification = new Notification({ userId, title, message });
        await newNotification.save();

        res.status(200).json({
            status: true, 
            message: 'Notification sent!',
            response: {
                notification: newNotification                 
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

// Get notifications for a user
async function handleGetUserNotifications (req, res){
    await dbConnect(); // ✅ dbConnect called
    try {   
        const notifications = await Notification.find({ userId: req.userId });
        res.status(200).json({
            status: true,
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
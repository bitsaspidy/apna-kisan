const express = require('express');
const router = express.Router();
const {handleSendNotification, handleGetUserNotifications} = require('../controllers/notificationController');
const authmiddleware = require('../middleware/authMiddleware');


router.post('/send',  handleSendNotification);
router.get('/:userId', authmiddleware, handleGetUserNotifications);

module.exports = router;
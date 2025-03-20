const express = require('express');
const router = express.Router();
const {handleSendNotification, handleGetUserNotifications} = require('../controllers/notificationController');
const authmiddleware = require('../middleware/authMiddleware');
const translateMiddleware = require('../middleware/translateMiddleware');


router.post('/send',  handleSendNotification);
router.get('/receive', authmiddleware, translateMiddleware, handleGetUserNotifications);

module.exports = router;
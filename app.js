const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Routes Require
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRoute');
const notificationRoute = require('./routes/notificationRoute');
const inventoryRoute = require('./routes/inventoryRoute');
const translateRoute = require('./routes/translateRoute');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());
// Routes 
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/notifications', notificationRoute);
app.use('/inventory', inventoryRoute);
app.use('/translate', translateRoute);
// ✅ Health Check Route - Homepage
app.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        message: 'APNA KISAN API is up and running 🚀'
    });
});

module.exports = app;

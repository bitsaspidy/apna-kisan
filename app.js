const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Routes Require
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRoute');
const notificationRoute = require('./routes/notificationRoute');
const inventoryRoute = require('./routes/inventoryRoute');
const translateRoute = require('./routes/translateRoute');
const translateMiddleware = require('./middleware/translateMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(translateMiddleware);

// Routes 
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/notifications', notificationRoute);
app.use('/inventory', inventoryRoute);
app.use('/translate', translateRoute);

module.exports = app;

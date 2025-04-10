const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const path = require("path");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const {connectToMongoDB} = require('./config');


// Routes Require
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRoute');
const notificationRoute = require('./routes/notificationRoute');
const inventoryRoute = require('./routes/inventoryRoute');
const translateRoute = require('./routes/translateRoute');
const transcationRoute = require('./routes/transcationRoute');
const cartRoute = require('./routes/cartRoute');
const checkoutRoute = require('./routes/checkoutRoute');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, req.body, req.params, req.query);
    next();
});
// Middlewares
app.use(cookieParser());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

//Routes 
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/notifications', notificationRoute);
app.use('/inventory', inventoryRoute);
app.use('/translate', translateRoute);
app.use('/transcation', transcationRoute);
app.use('/cart', cartRoute);
app.use('/checkout', checkoutRoute);



connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp")
.then(()=>console.log("Connected to MongoDb"));

module.exports = app;
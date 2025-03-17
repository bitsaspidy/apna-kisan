const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
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
const translateMiddleware = require('./middleware/translateMiddleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended : false}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(translateMiddleware);

//Routes 
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/notifications', notificationRoute);
app.use('/inventory', inventoryRoute);
app.use('/translate', translateRoute);


connectToMongoDB("mongodb+srv://singhdevavratdevavrat07:iNuCi52KepuIWyk9@kisanapp.1jecy.mongodb.net/apnakisan?retryWrites=true&w=majority&appName=kisanapp")
.then(()=>console.log("Connected to MongoDb"));

// Module Exports
module.exports = app;
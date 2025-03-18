const express = require('express');
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());
const port = 3000;

// Middleware to parse JSON
app.use(express.json());


// Start the server
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

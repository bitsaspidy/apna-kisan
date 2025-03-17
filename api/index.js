const app = require('../app'); // pointing to your existing app.js
const serverless = require('serverless-http'); // to convert express app into handler

module.exports = serverless(app);

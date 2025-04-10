const express = require('express');
const router = express.Router();
const {handleLanguageTranslate} = require("../controllers/translateController");
const axios = require('axios');
const translate = require('translate-google');
// const authMiddleware = require("../middleware/authMiddleware");

// Translate Routes
router.post('/', handleLanguageTranslate);

module.exports = router;

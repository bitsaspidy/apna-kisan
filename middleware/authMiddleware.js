const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function authmiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
            status: false,
             message: 'Unauthorized access' ,
             response: null
            });
    }

    const token = authHeader.split('Bearer ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.status(400).json({ status: false, message: "Forbidden Invalid token", Response: {err} });
        }

        req.userId = decoded.userId || decoded.id; 

        if (!req.userId) {
            return res.status(400).json({ status: false, message: "UserId not found in token", response: null });
        }

        next();
    });
};

module.exports = authmiddleware;
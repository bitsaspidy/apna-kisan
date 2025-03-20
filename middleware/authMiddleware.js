const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function authmiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(200).json({ message: 'Unauthorized access' });
    }

    const token = authHeader.split('Bearer ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.status(200).json({ message: "Forbidden Invalid token", error: err });
        }

        req.userId = decoded.userId || decoded.id; 

        if (!req.userId) {
            return res.status(200).json({ message: "UserId not found in token" });
        }

        next();
    });
};

module.exports = authmiddleware;
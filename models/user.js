const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['farmer', 'vendor', 'admin'] // Customize as needed
    },
    location: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    }
}, {
    timestamps: true
});

// ✅ Index for quick lookup on phone number
userSchema.index({ phonenumber: 1 }, { unique: true });

// ✅ Avoid OverwriteModelError in Vercel serverless environments
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

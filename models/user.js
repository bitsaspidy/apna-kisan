const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phonenumber: {
        type: String,
        required: true,
        unique: true  // ✅ Unique index created automatically
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['farmer', 'vendor', 'admin']
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

// ✅ Removed duplicate index declaration
// userSchema.index({ phonenumber: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

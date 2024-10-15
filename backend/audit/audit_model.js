const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const AuditSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, 
        refPath: 'userType',  
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    action: {
        type: String,  // Action performed (e.g., login, profile update, etc.)
        required: true
    },
    description: {
        type: String,  // Optional detailed description of the action
    },
    ipAddress: {
        type: String,  // Capture the IP address from which the action was performed
    },
    userAgent: {
        type: String,  // Capture the user agent (browser/device info)
    },
    createdAt: {
        type: Date,
        default: Date.now  // Timestamp when the action occurred
    }
}, { timestamps: true });  // `createdAt` and `updatedAt` fields will automatically be generated

const Audit = model('Audit', AuditSchema);

module.exports = Audit;

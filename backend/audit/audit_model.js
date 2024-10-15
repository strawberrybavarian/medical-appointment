const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const AuditSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'userType',
    },
    userType: {
        type: String,
        required: true,
        enum: ['Patient', 'Admin', 'Medical Secretary'],
    },
    action: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Audit = mongoose.model('Audit', AuditSchema);
module.exports = Audit;


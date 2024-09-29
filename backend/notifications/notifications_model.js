const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType'
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Cashier', 'Medical Secretary', 'Admin', 'Super Admin']
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;

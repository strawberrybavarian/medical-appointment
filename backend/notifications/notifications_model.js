// notifications_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    recipient: [{
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType'
    }],
    recipientType: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'MedicalSecretary', 'Admin']
    },
    type: {
        type: String,
        required: true,
        enum: ['Appointment', 'General', 'StatusUpdate'] // You can add more types as needed
    },
    date: {
        type: Date,
        default: Date.now
    },
    readBy: [{
        userId: {
            type: Schema.Types.ObjectId,
            refPath: 'recipientType'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;

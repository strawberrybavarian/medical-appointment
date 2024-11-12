// notifications_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    message: { type: String, required: true },
    receiver: { type: Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
    receiverModel: { type: String, required: true, enum: ['Patient', 'Doctor'] },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    type: { type: String, required: true, enum: ['News', 'Appointment', 'Message'] },
    recipientType: { type: String, required: true, enum: ['Patient', 'Doctor'] },
}, { timestamps: true });

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;

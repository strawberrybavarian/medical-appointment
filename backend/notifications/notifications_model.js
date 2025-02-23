// notifications_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    message: { type: String, required: true },
    receiver: [{ type: Schema.Types.ObjectId, required: true, refPath: 'receiverModel' }],
    receiverModel: { type: String, required: true, },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    type: { type: String, required: true,},
    recipientType: { type: String, required: true,},
}, { timestamps: true });

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;

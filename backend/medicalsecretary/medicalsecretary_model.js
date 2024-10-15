const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const {Schema, model} = mongoose

const MedicalSecretarySchema = new Schema({
    ms_firstName: {
        type: String,
  
    },
    ms_username:{
        type: String,

    },
    ms_lastName: {
        type: String,

    },
    ms_email: {
        type: String,
    },
    ms_password: {
        type: String,

    },
    ms_contactNumber: {
        type: String,
  
    },
    status:{
        type: String,
        default: 'pending'
    },
    ms_image: { type: String },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    ms_appointments: [{
        type: Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    role:{
        type:String,
        default: 'Medical Secretary'
    },
    news: [{
        type: Schema.Types.ObjectId,
        ref: 'News'  // Refers to the 'News' model
      }],
      audits: [{
        type: Schema.Types.ObjectId,
        ref: 'Audit'
    }],
}, { timestamps: true });

const MedicalSecretary = model('MedicalSecretary', MedicalSecretarySchema);
module.exports = MedicalSecretary;

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
      }]
}, { timestamps: true });

const MedicalSecretary = model('MedicalSecretary', MedicalSecretarySchema);
module.exports = MedicalSecretary;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');
const MedicalSecretarySchema = new Schema({
  ms_firstName: {
    type: String,
  },
  ms_username: {
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
  status: {
    type: String,
    default: 'pending',
  },
  ms_image: { 
    type: String,
  },
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification',
  }],
  ms_appointments: [{
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
  role: {
    type: String,
    default: 'Medical Secretary',
  },
  news: [{
    type: Schema.Types.ObjectId,
    ref: 'News', // Refers to the 'News' model
  }],
  audits: [{
    type: Schema.Types.ObjectId,
    ref: 'Audit',
  }],
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
}, { timestamps: true });

MedicalSecretarySchema.pre('save', async function (next){
  if (!this.isModified('ms_password')){
    return next();
  } try {
    const salt = await bcrypt.genSalt(10);
    this.ms_password = await bcrypt.hash(this.ms_password, salt);
    next();
  } catch (error){
    next(error);
  }
})

const MedicalSecretary = model('MedicalSecretary', MedicalSecretarySchema);

module.exports = MedicalSecretary;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

// Define a new schema to track booked slots for specific dates
const bookedSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  morning: { type: Number, default: 0 }, // Number of morning slots booked for this date
  afternoon: { type: Number, default: 0 } // Number of afternoon slots booked for this date
});

// Define timeSlotSchema for morning and afternoon time slots
const timeSlotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  interval: Number,
  available: { type: Boolean, default: false },
  maxPatients: { type: Number, default: 0 }  // Add maxPatients to time slot schema
});

// Define dailyAvailabilitySchema using timeSlotSchema for morning and afternoon availability
const dailyAvailabilitySchema = new mongoose.Schema({
  morning: { type: timeSlotSchema, default: () => ({}) },
  afternoon: { type: timeSlotSchema, default: () => ({}) }
});

// Define DoctorSchema
const DoctorSchema = new Schema({
  passwordChanged: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  dr_licenseNo: {
    type: String,
  },
  activityStatus: {
    type: String,
    enum: ['Online', 'Offline', 'In Session'],
    default: 'Offline'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  dr_image: {
    type: String,
    default: 'images/014ef2f860e8e56b27d4a3267e0a193a.jpg' 
  },
  dr_firstName: {
    type: String,
  },
  dr_lastName: {
    type: String,
  },
  dr_middleInitial: {
    type: String,
  },
  dr_email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  dr_password: {
    type: String,
  },
  dr_dob: {
    type: Date,
  },
  dr_age: {
    type: String,
  },
  dr_contactNumber: {
    type: String,
  },
  dr_specialty: {
    type: String,
  },
  dr_patients: [{
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  dr_posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  dr_appointments: [{
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  dr_medicalHistories: [{
    type: Schema.Types.ObjectId,
    ref: 'MedicalHistory',
    default: null
  }],
  dr_prescriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  activeAppointmentStatus: {
    type: Boolean,
    default: false
  },
  deactivationRequest: {
    requested: { type: Boolean, default: false }, // Indicates if there's a pending request
    reason: { type: String, default: '' },
    confirmed: { type: Boolean, default: null }, // null means pending, true means approved, false means rejected
  },
  availability: {
    monday: { type: dailyAvailabilitySchema, default: () => ({}) },
    tuesday: { type: dailyAvailabilitySchema, default: () => ({}) },
    wednesday: { type: dailyAvailabilitySchema, default: () => ({}) },
    thursday: { type: dailyAvailabilitySchema, default: () => ({}) },
    friday: { type: dailyAvailabilitySchema, default: () => ({}) },
    saturday: { type: dailyAvailabilitySchema, default: () => ({}) },
    sunday: { type: dailyAvailabilitySchema, default: () => ({}) }
  },
  bookedSlots: [bookedSlotSchema], // Track booked slots by specific date
  accountStatus: {
    type: String,
    enum: ['Review', 'Registered', 'Deactivated', 'Deleted'],
    default: 'Review'
  },
  biography: {
    medicalSchool: {
      institution: { type: String },
      yearGraduated: { type: Number }
    },
    residency: {
      institution: { type: String },
      yearCompleted: { type: Number }
    },
    fellowship: {
      institution: { type: String },
      yearCompleted: { type: Number }
    },
    localSpecialtyBoard: {
      certification: { type: String },
      issuingOrganization: { type: String },
      year: { type: Number }
    },
    localSubSpecialtyBoard: {
      certification: { type: String },
      issuingOrganization: { type: String },
      year: { type: Number }
    }
  },
  dr_services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service' // Reference to the services the doctor offers
  }],
  dr_hmo: [{
    type: Schema.Types.ObjectId,
    ref: 'Hmo' 
  }],
  role: {
    type: String,
    default: 'Physician'
  },
}, { timestamps: true });

DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('dr_password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.dr_password = await bcrypt.hash(this.dr_password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
// // Define a method on DoctorSchema to generate QR code for two-factor authentication
// DoctorSchema.methods.generateQRCode = async function() {
//     const otpAuthUrl = speakeasy.otpauthURL({ 
//       secret: this.twoFactorSecret, 
//       label: Landagan Kids Clinic:${this.dr_email}, 
//       issuer: 'Landagan Kids Clinic',
//       encoding: 'base32'
//     });
//     console.log('Generated OTP Auth URL:', otpAuthUrl); // Log the URL for debugging
//     return await QRCode.toDataURL(otpAuthUrl);
// };
// Create Doctor model based on DoctorSchema
const Doctor = model('Doctor', DoctorSchema);

module.exports = Doctor;

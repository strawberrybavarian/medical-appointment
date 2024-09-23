const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define timeSlotSchema for morning and afternoon time slots
const timeSlotSchema = new mongoose.Schema({
    startTime: String,
    endTime: String,
    interval: Number,
    available: { type: Boolean, default: false }
});

// Define dailyAvailabilitySchema using timeSlotSchema for morning and afternoon availability
const dailyAvailabilitySchema = new mongoose.Schema({
    morning: { type: timeSlotSchema, default: () => ({}) },
    afternoon: { type: timeSlotSchema, default: () => ({}) }
});

// Define DoctorSchema
const DoctorSchema = new Schema({

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
        default: '' // Default image path if needed
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
    dr_age:{
        type:String,
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
    accountStatus:{
        type: String,
        enum: ['Review', 'Registered', 'Deactivated', 'Deleted'],
        default: 'Review'
    },
    biography: {
        
        personalStatement: {
            type: String,
            default: '' // A short personal statement or introductory text
        },
        education: [{
            degree: String,
            institution: String,
            year: Number
        }],
        certifications: [{
            certification: String,
            issuingOrganization: String,
            year: Number
        }],
        workExperience: [{
            position: String,
            organization: String,
            startDate: Date,
            endDate: Date,
            description: String
        }],
        achievements: [String], 
        researchInterests: [String] 
    },
    dr_services: [{
        type: Schema.Types.ObjectId,
        ref: 'Service' // Reference to the services the doctor offers
    }],
}, { timestamps: true });

// Define a method on DoctorSchema to generate QR code for two-factor authentication
DoctorSchema.methods.generateQRCode = async function() {
    const otpAuthUrl = speakeasy.otpauthURL({ 
      secret: this.twoFactorSecret, 
      label: `Landagan Kids Clinic:${this.dr_email}`, 
      issuer: 'Landagan Kids Clinic',
      encoding: 'base32'
    });
    console.log('Generated OTP Auth URL:', otpAuthUrl); // Log the URL for debugging
    return await QRCode.toDataURL(otpAuthUrl);
};

// Create Doctor model based on DoctorSchema
const Doctor = model('Doctor', DoctorSchema);

module.exports = Doctor;

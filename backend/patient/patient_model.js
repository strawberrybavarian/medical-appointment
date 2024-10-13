const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema, model } = mongoose;

const PatientSchema = new Schema({
    // Personal info
    patient_ID: {
        type: String,
        unique: true
    },
    role:{
        type: String,
        default: 'Patient'
    },
    patient_image: {   
        type: String,
    },
    patient_firstName: {
        type: String,
    },
    patient_middleInitial: {
        type: String,
    },
    patient_lastName: {
        type: String,
    },
    patient_email: {
        type: String,
        unique: true,
        sparse: true
    },
    patient_password: {
        type: String,
    },
    patient_dob: {
        type: Date,
    },
    patient_age: {
        type: String
    },
    accountStatus: {
        type: String,
        enum: ['Registered', 'Unregistered', 'Deactivated', 'Deleted'],
        default: 'Registered'
    },
    patient_contactNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return v.length === 11;
            },
            message: props => `${props.value} has to be 11 characters long.`
        }
    },
    patient_gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    patient_appointments: [{
        type: Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    patient_findings: [{
        type: Schema.Types.ObjectId,
        ref: 'Findings'
    }],
    patient_address: {  // Added patient_address field
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        country: {
            type: String,
        }
    },
    patient_nationality:{
        type: String,
    },
    patient_civilstatus:{
        type: String,
    },
    
    medicalHistory: {
        type: Schema.Types.ObjectId,
        ref: 'MedicalHistory'
    },
    prescriptions: [{
        type: Schema.Types.ObjectId,
        ref: 'Prescription'
    }],
    laboratoryResults: [{
        type: Schema.Types.ObjectId,
        ref: 'Laboratory'
    }],
    immunizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Immunization'
    }],
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    lastProfileUpdate: { // New field to track profile updates
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Keep timestamps for `createdAt` and `updatedAt`

// Pre-save hook for generating the patient ID
PatientSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }
    const currentYear = new Date().getFullYear();

    try {
        const highestPatient = await this.constructor.findOne({ patient_ID: new RegExp(`^P${currentYear}`, 'i') })
            .sort({ patient_ID: -1 })
            .limit(1);
        let nextNumber = 1;
        if (highestPatient) {
            const lastNumber = parseInt(highestPatient.patient_ID.split('-')[1]);
            nextNumber = lastNumber + 1;
        }
        const paddedNumber = nextNumber.toString().padStart(6, '0');
        this.patient_ID = `P${currentYear}-${paddedNumber}`;
        next();
    } catch (error) {
        next(error);
    }
});

const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

PatientSchema.methods.generateQRCode = async function () {
    const otpAuthUrl = speakeasy.otpauthURL({
        secret: this.twoFactorSecret,
        label: `Landagan Kids Clinic:${this.patient_email}`,
        issuer: 'Landagan Kids Clinic',
        encoding: 'base32'
    });
    console.log('Generated OTP Auth URL:', otpAuthUrl); // Log the URL for debugging
    return await QRCode.toDataURL(otpAuthUrl);
};



PatientSchema.pre('save', async function (next) {

    if (this.isNew) {
        return next();  
    }
    if (!this.isModified('accountStatus')) {
        return next(); 
    }

    const lastStatusUpdate = this.lastProfileUpdate || this.updatedAt; 
    const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();


    if (lastStatusUpdate && (now - lastStatusUpdate.getTime()) < thirtyDaysInMillis) {
        const error = new Error("Account status can only be updated once every 30 days.");
        return next(error);
    }
    this.lastProfileUpdate = new Date();
    next();
});



const Patient = model('Patient', PatientSchema);

module.exports = Patient;

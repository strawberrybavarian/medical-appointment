const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema, model } = mongoose;

const PatientSchema = new Schema({
    // Personal info
    patient_ID: {
        type: String,
        unique: true
    },
    patient_firstName: {
        type: String,
        minlength: 3,
        maxlength: 20
    },
    patient_middleInitial: {
        type: String,
        maxlength: 1
    },
    patient_lastName: {
        type: String,
        minlength: 2,
        maxlength: 20
    },
    patient_email: {

        type: String,
        unique: true,
        sparse: true


    },
    patient_password: {
        type: String,
        minlength: 6,
    },
    patient_dob: {
        type: Date,
    },
    patient_age: {
        type: String
    },
    accountStatus:{
        type:String,
        
        enum: ['Registered','Unregistered','Deactivated','Deleted'],
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
    patient_findings:[{
        type:Schema.Types.ObjectId,
        ref: 'Findings'
    }],
    medicalHistory: {
        type: Schema.Types.ObjectId,
        ref: 'MedicalHistory'
    },

    prescriptions: [{
        type: Schema.Types.ObjectId,
        ref: 'Prescription'
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
    }
}, { timestamps: true });

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





const Patient = model('Patient', PatientSchema);

module.exports = Patient;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema, model } = mongoose;
const Audit = require('../audit/audit_model');  // Import the Audit model

const PatientSchema = new Schema({
    // Personal info
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    patient_ID: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        default: 'Patient'
    },
    patient_image: {   
        type: String,
        default: 'images/014ef2f860e8e56b27d4a3267e0a193a.jpg'
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
        
        default: 'Registered'
    },
    patient_contactNumber: {
        type: String,
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
    patient_address: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        barangay: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        region: {
            type: String,
        }
    },
    patient_nationality: {
        type: String,
    },
    patient_civilstatus: {
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
    
    // Add audits as a reference array
    audits: [{
        type: Schema.Types.ObjectId,
        ref: 'Audit'
    }],

    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    lastProfileUpdate: { 
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Keep timestamps for `createdAt` and `updatedAt`

// Pre-save hook for hashing password
PatientSchema.pre('save', async function (next) {
    if (!this.isModified('patient_password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.patient_password = await bcrypt.hash(this.patient_password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

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

// Method to generate QRCode for 2FA
PatientSchema.methods.generateQRCode = async function () {
    const otpAuthUrl = speakeasy.otpauthURL({
        secret: this.twoFactorSecret,
        label: `Landagan Kids Clinic:${this.patient_email}`,
        issuer: 'Landagan Kids Clinic',
        encoding: 'base32'
    });
    return await QRCode.toDataURL(otpAuthUrl);
};

// Hook to audit account status changes
PatientSchema.pre('save', async function (next) {
    if (!this.isNew && this.isModified('accountStatus')) {
        const lastStatusUpdate = this.lastProfileUpdate || this.updatedAt; 
        const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (lastStatusUpdate && (now - lastStatusUpdate.getTime()) < thirtyDaysInMillis) {
            const error = new Error("Account status can only be updated once every 30 days.");
            return next(error);
        }

        // Audit record for account status change
        const auditData = {
            user: this._id,
            userType: 'Patient',
            action: 'Account Status Update',
            description: `Account status changed to ${this.accountStatus}`,
            ipAddress: this._reqIp || 'N/A',
            userAgent: this._userAgent || 'N/A'
        };

        const auditRecord = await new Audit(auditData).save();

        // Add audit reference to the patient's audits array
        this.audits.push(auditRecord._id);

        this.lastProfileUpdate = new Date();
    }
    next();
});

// Other audit logs for specific actions can be added similarly

const Patient = model('Patient', PatientSchema);

module.exports = Patient;

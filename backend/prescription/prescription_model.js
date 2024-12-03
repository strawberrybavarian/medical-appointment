const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PrescriptionSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },

    // Detailed medication array
    medications: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true // E.g., tablet, syrup, ointment, etc.
        },
        dosage: {
            type: String,
            required: true // E.g., "500mg"
        },
        frequency: {
            type: String,
            required: true // E.g., "Twice a day", "Once in the morning"
        },
        duration: {
            type: String,
            required: true // E.g., "7 days", "2 weeks"
        },
        instruction: {
            type: String,
            required: true // E.g., "Take after meals", "Avoid dairy"
        },
        notes: {
            type: String,
            default: '' // Additional notes, if any
        }
    }],


    // Optional fields for additional prescription details
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    
    prescriptionImages: [{
        type: String,
        default: '' // Path to prescription images
    }],
    
    // Optional expiry date for prescription validity
    expiryDate: {
        type: Date,
        default: null // Prescription expiry date
    },

    // Additional notes or instructions for the whole prescription
    generalNotes: {
        type: String,
        default: ''
    }

}, { timestamps: true });

const Prescription = model('Prescription', PrescriptionSchema);

module.exports = Prescription;

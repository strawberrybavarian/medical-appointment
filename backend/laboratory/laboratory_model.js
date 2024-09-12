const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const LaboratorySchema = new Schema({
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

    // Array of test results (only storing the result information, not actual test performance)
    testResults: [{
        name: {
            type: String,
            required: true // E.g., Hemoglobin, Glucose
        },
        value: {
            type: String,
            required: true // E.g., 13.5, 120
        },
        unit: {
            type: String,
            required: true // E.g., g/dL, mg/dL
        },
        referenceRange: {
            lower: {
                type: Number, // Lower limit of the normal range
                required: true
            },
            upper: {
                type: Number, // Upper limit of the normal range
                required: true
            }
        },
        status: {
            type: String,
            enum: ['Normal', 'Abnormal', 'Critical'],
            required: true,
            default: 'Normal'
        },
        notes: {
            type: String,
            default: '' // Any additional notes about the result
        }
    }],

    // Doctor's interpretation of the overall lab results
    interpretation: {
        type: String,
        required: true // Doctor's interpretation of the results (e.g., "Patient is anemic", "Blood sugar levels elevated")
    },

    // Doctor's recommendations based on the interpretation
    recommendations: {
        type: String,
        required: true // Doctor's clinical recommendations based on the lab results (e.g., "Increase iron intake", "Start insulin therapy")
    },

    // Optional status of the lab result interpretation
    status: {
        type: String,
        enum: ['Pending Review', 'Reviewed', 'Action Taken'],
        default: 'Pending Review'
    },
    
    // Timestamps for when the interpretation was made
    interpretationDate: {
        type: Date,
        required: true,
        default: Date.now // When the doctor reviewed and interpreted the results
    },

    // Additional notes or remarks from the doctor
    remarks: {
        type: String,
        default: '' // Any further comments or notes from the doctor
    }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Laboratory = model('Laboratory', LaboratorySchema);

module.exports = Laboratory;

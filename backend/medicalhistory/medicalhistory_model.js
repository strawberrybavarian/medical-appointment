const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicalHistorySchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    historyOfPresentIllness: {
        chiefComplaint: {
            type: String,
            required: true
        },
        currentSymptoms: [{
            type: String,
            required: true
        }]
    },
    diagnosis: {
        type: String,
        required: true
    },
    pastMedicalHistory: [{
        type: String,
        required: false
    }],
    familyHistory: [{
        type: String,
        required: false
    }],
    immunizations: [{
        type: Schema.Types.ObjectId,
        ref: 'Immunization',
        required: false
    }]
}, { timestamps: true });

const MedicalHistory = model('MedicalHistory', MedicalHistorySchema);

module.exports = MedicalHistory;

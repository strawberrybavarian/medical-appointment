const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicalHistorySchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
    },
    appointment:{
        type: Schema.Types.ObjectId,
        ref:'Appointment',
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    historyOfPresentIllness: {
        chiefComplaint: {
            type: String,
        },
        currentSymptoms: [{
            type: String,
      
        }]
    },
    diagnosis:{
        type: String,
      
    },
    pastMedicalHistory: [{
        type: String
    }],
    familyHistory: [{
        type: String
    }]
}, { timestamps: true });

const MedicalHistory = model('MedicalHistory', MedicalHistorySchema);

module.exports = MedicalHistory;

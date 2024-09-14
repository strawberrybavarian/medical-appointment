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

    testResults: [{
        name: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String, required: true },
        referenceRange: {
            lower: { type: Number, required: true },
            upper: { type: Number, required: true }
        },
        status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'], required: true, default: 'Normal' },
        notes: { type: String, default: '' }
    }],
    interpretation: { type: String, required: true },
    recommendations: { type: String, required: true },
  
    interpretationDate: { type: Date, required: true, default: Date.now },
    remarks: { type: String, default: '' },

   
    file: {
        path: { type: String }, 
        filename: { type: String } 
    }

}, { timestamps: true });
const Laboratory = model('Laboratory', LaboratorySchema);

module.exports = Laboratory;

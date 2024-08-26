const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const FindingsSchema = new Schema({
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
    bloodPressure: {
        systole: {
            type: Number,
        
        },
        diastole: {
            type: Number,
  
        }
    },
    respiratoryRate: {
        type: Number,
     
    },
    pulseRate: {
        type: Number,
     
    },
    temperature: {
        type: Number,
        
    },
    weight: {
        type: Number,
     
    },
    height: {
        type: Number,
   
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

const Findings = model('Findings', FindingsSchema);

module.exports = Findings;

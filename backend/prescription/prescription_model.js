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
    
    medications: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        instruction: {
            type: String,
            required: true
        }
    }],

    prescriptionImage:{
        type: String,
        default: ''
    }

}, { timestamps: true });

const Prescription = model('Prescription', PrescriptionSchema);

module.exports = Prescription;

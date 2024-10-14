// appointment_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({
    appointment_type: [
        {
            appointment_type: {
                type: String, // Store the name of the service
        
            },
            category: {
                type: String, // Store the category of the service
        
            }
        }
    ],
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    secretary: {
        type: Schema.Types.ObjectId,
        ref: 'MedicalSecretary',
    },
    date: {
        type: Date,
    },
    time: {
        type: String,
    },
    reason: {
        type: String,
    },
    cancelReason: {
        type: String,
    },
    rescheduledReason: {
        type: String,
    },
    status: {
        type: String,
        
        default: 'Pending'
    },
    medium: {
        type: String,
        enum: ['Online', 'Face to Face'],
    },
    prescription: {
        type: Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    findings: {
        type: Schema.Types.ObjectId,
        ref: 'Findings'
    },
    immunization: [{
        type: Schema.Types.ObjectId,
        ref: 'Immunization'
    }],
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    laboratoryResults: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Laboratory'
        }
      ],
}, { timestamps: true });

const Appointment = model('Appointment', AppointmentSchema);
module.exports = Appointment;

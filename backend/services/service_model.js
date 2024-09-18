const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ServiceSchema = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
     
        enum: ['Laboratory', '2D-Echo', 'ECG' ,'Ultrasound', 'X-Ray', 'Consultation', 'Pre-employment',],  // Define your categories based on your services
    },

    availability: {
        type: String,
        enum: ['Available', 'Not Available', 'Coming Soon'],
        default: 'Available',
    },
    requirements: [{
        type: String,  // List any pre-requirements (e.g., fasting, doctor referral)
    }],
    doctors: [{
        type: Schema.Types.ObjectId,
        ref: 'Doctor',  // Reference doctors who offer these services (e.g., for consultation, 2D-Echo)
    }],
}, { timestamps: true });

const Service = model('Service', ServiceSchema);
module.exports = Service;
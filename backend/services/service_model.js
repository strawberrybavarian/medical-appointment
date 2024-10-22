// File: service_model.js

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
    },
    availability: {
        type: String,
        enum: ['Available', 'Not Available', 'Coming Soon'],
        default: 'Available',
    },
    requirements: [{
        type: String,
    }],
    doctors: [{
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
    }],
    imageUrl: {
        type: String, // This field will store the path to the image
    },
}, { timestamps: true });

const Service = model('Service', ServiceSchema);
module.exports = Service;

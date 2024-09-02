const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ImmunizationSchema = new Schema({
    vaccineName: {
        type: String,
        minlength: 3,
        maxlength: 100,
        required: true
    },
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    administeredBy: {
        type: Schema.Types.ObjectId,
        ref: 'HealthcareProvider',
        required: true
    },
    dateAdministered: {
        type: Date,
        required: true,
        default: Date.now
    },
    doseNumber: {
        type: Number,
        required: true
    },
    totalDoses: {
        type: Number,
        required: true
    },
    lotNumber: {
        type: String,
        required: false
    },
    siteOfAdministration: {
        type: String,
        required: false
    },
    routeOfAdministration: {
        type: String,
        enum: ['Intramuscular', 'Subcutaneous', 'Oral', 'Intranasal'],
        required: true
    },
    notes: {
        type: String,
        maxlength: 500,
        required: false
    }
}, { timestamps: true });

const Immunization = model('Immunization', ImmunizationSchema);
module.exports = Immunization;

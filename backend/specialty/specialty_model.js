const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const SpecialtySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
}, { timestamps: true });

const Specialty = model('Specialty', SpecialtySchema);
module.exports = Specialty;

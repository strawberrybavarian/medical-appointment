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
        
    },


   
    file: {
        path: { type: String }, 
        filename: { type: String } 
    }

}, { timestamps: true });
const Laboratory = model('Laboratory', LaboratorySchema);

module.exports = Laboratory;

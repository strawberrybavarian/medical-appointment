const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ImmunizationSchema = new Schema({
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        require: true
    },
    vaccineName: {
        type: String,
        minlength: 3,
        maxlength: 100,
   
    },
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
 
    },
    administeredBy: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
   
    },
    dateAdministered: {
        type: Date,
  
        default: Date.now
    },
    doseNumber: {
        type: Number,
      
    },
    totalDoses: {
        type: Number,
       
    },
    lotNumber: {
        type: String,
 
    },
    siteOfAdministration: {
        type: String,
    
    },
    routeOfAdministration: {
        type: String,
        enum: ['Intramuscular', 'Subcutaneous', 'Oral', 'Intranasal'],
   
    },
    notes: {
        type: String,
        maxlength: 500,
     
    }
}, { timestamps: true });

const Immunization = model('Immunization', ImmunizationSchema);
module.exports = Immunization;

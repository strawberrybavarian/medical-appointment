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

    testResults: [{
        name: { type: String,  },
        value: { type: String,  },
        unit: { type: String,  },
        referenceRange: {
            lower: { type: Number,},
            upper: { type: Number, }
        },
        status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'], default: 'Normal' },
        notes: { type: String, default: '' }
    }],
    interpretation: { type: String,  },
    recommendations: { type: String, },
  
    interpretationDate: { type: Date, default: Date.now },
    remarks: { type: String, default: '' },

   
    file: {
        path: { type: String }, 
        filename: { type: String } 
    }

}, { timestamps: true });
const Laboratory = model('Laboratory', LaboratorySchema);

module.exports = Laboratory;

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

    // History of Present Illness (HPI)
    historyOfPresentIllness: {
        chiefComplaint: {
            type: String, // Main reason for the visit
            required: true
        },
        currentSymptoms: [{
            type: String, // List of current symptoms reported by the patient
            required: true
        }]
    },

    assessment:{
        type: String
    },
    remarks: {
        type: String,                   // Doctor's remarks and additional observations
    },
    interpretation: {
        type: String,                   // Doctor's interpretation of the findings
    },
    recommendations: {
        type: String,                   // Doctor's treatment recommendations or instructions
    },

    // Lifestyle factors (optional)
    lifestyle: {
        smoking: {
            type: Boolean,            
            default: false
        },
        alcoholConsumption: {
            type: Boolean,              
            default: false
        },
        others: {
            type: [String],  // Array of strings to capture additional lifestyle information
            default: []      // Default to an empty array
        }
    },
    

    // Family history of relevant medical conditions
    familyHistory: [{
        relation: {
            type: String,               // Relationship to the patient (e.g., mother, father)
        },
        condition: {
            type: String,               // Medical condition (e.g., diabetes, heart disease)
        }
    }],

    // Social history (important for certain health conditions)
    socialHistory: {
        employmentStatus: {
            type: String,               // Employment status (e.g., employed, unemployed, retired)
        },
        livingSituation: {
            type: String,               // Living situation (e.g., alone, with family)
        },
        socialSupport: {
            type: Boolean,              // Whether the patient has a strong social support network
            default: true
        }
    },

    // Mental health and emotional well-being
    mentalHealth: {
        mood: {
            type: String,               // Description of the patient's mood (e.g., happy, anxious)
        },
        anxietyLevel: {
            type: Number,               // Self-reported anxiety level (0-10 scale)
        },
        depressionLevel: {
            type: Number,               // Self-reported depression level (0-10 scale)
        }
    },

    allergy: {
        type: [String],  // Allows multiple allergies as an array of strings
    },

    // Additional findings
    skinCondition: {
        type: [String],  // Allows multiple skin conditions (array of strings)
    },
    neurologicalFindings: {
        type: String,                   // Description of any neurological issues
    },
    gastrointestinalSymptoms: {
        type: String,                   // Any symptoms related to the GI tract (e.g., nausea, constipation)
    },
    cardiovascularSymptoms: {
        type: String,                   // Description of any cardiovascular symptoms (e.g., chest pain, palpitations)
    },

    reproductiveHealth: {
        type: String,                   // Notes on reproductive health (e.g., menstrual cycle, pregnancy status)
    }

}, { timestamps: true });

const Findings = model('Findings', FindingsSchema);

module.exports = Findings;

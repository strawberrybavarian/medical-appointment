const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const {Schema, model} = mongoose

const MedicalSecretarySchema = new Schema({
    ms_firstName: {
        type: String,
        minlength: 3,
        maxlength: 20
    },
    ms_username:{
        type: String,
        minlength: 2,
        maxlength: 20
    },
    ms_lastName: {
        type: String,
        minlength: 2,
        maxlength: 20
    },
    ms_email: {
        type: String,

        lowercase: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} is not a valid email address.`
        }
    },
    ms_password: {
        type: String,
        minlength: 6,
    },
    ms_contactNumber: {
        type: String,
  
    },
    ms_appointments: [{
        type: Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
}, { timestamps: true });

const MedicalSecretary = model('MedicalSecretary', MedicalSecretarySchema);
module.exports = MedicalSecretary;

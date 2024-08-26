const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Schema, model} = mongoose

const PractitionerSchema = new Schema ({
    firstName: {
        type: String,
        require: true,
        min: 3,
        max: 20
    },
    lastName: {
        type: String,
        require: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        require: true,
        min: 6,
    },
    role: {
        type: String,
        enum: ['Practitioner'],
        default:'Practitioner',
    },
    patients: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Patient' 
    }],
    post:{
        type:Array,
        default: ()=> []
    },
    appointments: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Appointment' }]
        }, { timestamps: true });
 


PractitionerSchema.method({
    async authenticate(password) {
       return bcrypt.compare(password, this.password);
    },
  }); 

  //collection
const User = mongoose.model('practitioner', PractitionerSchema);

module.exports = {
    User,
};
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const {Schema, model} = mongoose

const UserSchema = new Schema ({

    //personal info

    user_firstName: {
        type: String,
        required: true, //requireD daw dapat sabi sa google
        minlength: 3,
        maxlength: 20
    },
    user_middleInitial: {
        type: String,
        maxlength: 1
    },
    user_lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /\S+@\S+\.\S+/.test(v); //regex to validate __@__.__ i.e. xyz@abc.com
            },
            message: props => `${props.value} is not a valid email address.`
        }
    },
    user_password: {
        type: String,
        required: true,
        minlength: 6,
    },
    user_dob: {
        type: Date,
        required: true,
    },
    user_joinedAt: {
        type: Date,
        required: true,
    },
    user_contactNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return v.length == 11
            },
            message: props => `${props.value} has to be 11 characters long.`
        }
    },
    user_gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    // role: {
    //     type: String,
    //     enum: ['Patient', 'Practitioner'],
    //     default:'Patient',
    //     required: true
    // },

    //not personal

    user_post:{
        type:Array,
        default: ()=> []
    },
    // user_appts: {
    //     type: [AppointmentSchema]
    // }

})

// UserSchema.method({
//     async authenticate(password) {
//        return bcrypt.compare(password, this.password);
//     },
//   }); 

const User = mongoose.model('Dummy', UserSchema);

module.exports = User;
const mongoose = require('mongoose');


const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,

    },
    lastName: {
        type: String,

    },
    username:{
        type: String,
    },
    email: {
        type: String,

    },
    password: {
        type: String, 
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;

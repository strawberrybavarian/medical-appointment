const mongoose = require('mongoose');
const {Schema, model} = mongoose

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
    },
    role:{
        type:String,
        default: 'Admin'
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    news: [{
        type: Schema.Types.ObjectId,
        ref: 'News'  // Refers to the 'News' model
      }]
}, { timestamps: true });


const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;

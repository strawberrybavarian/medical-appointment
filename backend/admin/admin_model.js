const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String, 
    },
    lastLogin: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    contactNumber: {
        type: String,
    },
    birthdate: {
        type: Date,
    },
    role: {
        type: String,
        default: 'Admin',
    },
    status:{
        type: String,
        default: 'pending'
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification',
    }],
    news: [{
        type: Schema.Types.ObjectId,
        ref: 'News',
    }],
    specialties: [{
        type: Schema.Types.ObjectId,
        ref: 'Specialty',
    }],
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Service',
    }],
    audits: [{
        type: Schema.Types.ObjectId,
        ref: 'Audit'
    }],
}, { timestamps: true });

AdminSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

AdminSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err){
        next(err);
    }
})
const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CashierSchema = new Schema({
    cs_firstName: {
        type: String,
    },
    cs_username:{
        type: String,
    },
    cs_lastName: {
        type: String,
    },
    cs_email: {
        type: String,
    },
    cs_password: {
        type: String,
        minlength: 6,
    },
    cs_contactNumber: {
        type: String,
  
    },

}, { timestamps: true });

const Cashier = model('Cashier', CashierSchema);
module.exports = Cashier;

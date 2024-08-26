// payment_model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Review', 'Unpaid', 'Inexact', 'Refund'],
        default: 'Unpaid'
    },
    inexactAmount: {
        type: Number,
        default: 0
    },
    refundReason: {
        type: String,
    },
    proofOfPayment: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Payment = model('Payment', PaymentSchema);
module.exports = Payment;

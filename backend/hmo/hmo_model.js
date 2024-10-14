const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const HmoSchema = new Schema({
    name: {
        type: String,
    },
    doctors: [{
        type: Schema.Types.ObjectId,
        ref: 'Doctor', 
    }],
}, { timestamps: true });

const Hmo = model('Hmo', HmoSchema);
module.exports = Hmo;
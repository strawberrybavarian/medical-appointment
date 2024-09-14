const mongoose = require('mongoose');
const { Schema } = mongoose;

const NewsSchema = new Schema({
  content: {
    type: String,
    required: true,
    minlength: 3,
  },
  posted_by: {
    type: Schema.Types.ObjectId,
    refPath: 'role',
    required: true,
  },
  headline:{
    type: String
  },
  role: {
    type: String,
    enum: ['MedicalSecretary', 'Admin'],
    required: true,
  },
  images: [{ type: String }],  // Array of image base64 strings
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);

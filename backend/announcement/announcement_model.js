const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  content: {
    type: String,
    required: true,
    minlength: 3,
  },
  doctor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  images: [{type: String}],  // Array of image base64 strings //ewan ko bakit base64 masyadong mababa
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);

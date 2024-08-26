const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PostSchema = new Schema({
  content: {
    type: String,
    required: true,
    minlength: 3,
  },
  doctor_id: {
    //referencing the doctor_id
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
}, { timestamps: true });

const Post = model('Post', PostSchema);
module.exports = Post;

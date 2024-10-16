const mongoose = require('mongoose');
const { Schema } = mongoose;

const NewsSchema = new Schema({
  news_ID: {
    type: Number,
    unique: true,
  },
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
  headline: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Medical Secretary', 'Admin'], // Use correct model names
    required: true,
  }
,  
  images: [{ type: String }],
}, { timestamps: true });

// Pre-save hook to auto-increment news_ID
NewsSchema.pre('save', async function (next) {
  const doc = this;

  // Only increment if the document is new
  if (doc.isNew) {
    // Find the maximum news_ID in the current News collection
    const lastNews = await mongoose.model('News').findOne().sort({ news_ID: -1 });

    // If there's no news document, start at 1, otherwise increment from the highest existing ID
    doc.news_ID = lastNews ? lastNews.news_ID + 1 : 1;
  }

  next();
});

module.exports = mongoose.model('News', NewsSchema);

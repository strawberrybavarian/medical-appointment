const mongoose = require('mongoose');

const aboutCompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    logo: {
      type: String,
      default: 'default-logo.png',
    },
    slogan: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    mission: {
      type: String,
      trim: true,
    },
    vision: {
      type: String,
      trim: true,
    },
    values: [String],
    establishedYear: {
      type: Number,
    },
    phoneNumbers: [String],
    emails: [String],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    team: [
      {
        name: String,
        position: String,
        bio: String,
        image: String,
      },
    ],
    galleryImages: [String],
    businessHours: [
      {
        day: String,
        openTime: String,
        closeTime: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        year: Number,
      },
    ],
  },
  { timestamps: true }
);

const AboutCompany = mongoose.model('AboutCompany', aboutCompanySchema);

module.exports = AboutCompany;
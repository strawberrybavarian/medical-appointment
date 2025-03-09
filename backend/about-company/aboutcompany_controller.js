const fs = require('fs');
const path = require('path');
const AboutCompany = require('./aboutcompany_model');

// Get company information
const getCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve company information',
      error: error.message
    });
  }
};

// Create company information (if none exists yet)
const createCompanyInfo = async (req, res) => {
  try {
    // Check if company info already exists
    const existingInfo = await AboutCompany.findOne();
    
    if (existingInfo) {
      return res.status(400).json({
        status: 'error',
        message: 'Company information already exists. Use update endpoint instead.'
      });
    }
    
    // Create new company info
    const newCompanyInfo = await AboutCompany.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        companyInfo: newCompanyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create company information',
      error: error.message
    });
  }
};

// Update company information
const updateCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await AboutCompany.findOneAndUpdate(
      {}, // Update the first document (there should only be one)
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true // Validate the update against schema
      }
    );
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update company information',
      error: error.message
    });
  }
};

// Upload company logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    // Delete old logo if it exists and is not the default
    if (companyInfo.logo && companyInfo.logo !== 'default-logo.png') {
      const oldLogoPath = path.join(__dirname, '../public/uploads/', companyInfo.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
    // Update with new logo
    companyInfo.logo = req.file.filename;
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// Add team member
const addTeamMember = async (req, res) => {
  try {
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    companyInfo.team.push(req.body);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add team member',
      error: error.message
    });
  }
};

// Remove team member
const removeTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    companyInfo.team = companyInfo.team.filter(
      member => member._id.toString() !== memberId
    );
    
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove team member',
      error: error.message
    });
  }
};

// Upload gallery image
const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    // Add new image to gallery
    companyInfo.galleryImages.push(req.file.filename);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload gallery image',
      error: error.message
    });
  }
};

// Remove gallery image
const removeGalleryImage = async (req, res) => {
  try {
    const { imageIndex } = req.params;
    
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    if (imageIndex < 0 || imageIndex >= companyInfo.galleryImages.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid image index'
      });
    }
    
    // Remove image file
    const imageToRemove = companyInfo.galleryImages[imageIndex];
    const imagePath = path.join(__dirname, '../public/uploads/', imageToRemove);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Remove from array
    companyInfo.galleryImages.splice(imageIndex, 1);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove gallery image',
      error: error.message
    });
  }
};

// Add achievement
const addAchievement = async (req, res) => {
  try {
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    companyInfo.achievements.push(req.body);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add achievement',
      error: error.message
    });
  }
};

// Remove achievement
const removeAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    companyInfo.achievements = companyInfo.achievements.filter(
      achievement => achievement._id.toString() !== achievementId
    );
    
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove achievement',
      error: error.message
    });
  }
};

// Add business hour
const addBusinessHour = async (req, res) => {
  try {
    const companyInfo = await AboutCompany.findOne();
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Company information not found'
      });
    }
    
    companyInfo.businessHours.push(req.body);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add business hour',
      error: error.message
    });
  }
};

// Update business hour
const updateBusinessHour = async (req, res) => {
  try {
    const { hourId } = req.params;
    
    const companyInfo = await AboutCompany.findOne({
      'businessHours._id': hourId
    });
    
    if (!companyInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Business hour not found'
      });
    }
    
    const hourIndex = companyInfo.businessHours.findIndex(
      hour => hour._id.toString() === hourId
    );
    
    if (hourIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Business hour not found'
      });
    }
    
    // Update business hour
    Object.assign(companyInfo.businessHours[hourIndex], req.body);
    await companyInfo.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        companyInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update business hour',
      error: error.message
    });
  }
};

module.exports = {
  getCompanyInfo,
  createCompanyInfo,
  updateCompanyInfo,
  uploadLogo,
  addTeamMember,
  removeTeamMember,
  uploadGalleryImage,
  removeGalleryImage,
  addAchievement,
  removeAchievement,
  addBusinessHour,
  updateBusinessHour
};
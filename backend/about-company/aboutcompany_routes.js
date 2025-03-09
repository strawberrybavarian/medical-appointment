const AboutCompanyController = require('./aboutcompany_controller');
const multer = require('multer');
const path = require('path');

console.log('About Company Routes Connected');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'company-' + uniqueSuffix + ext);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = app => {
  // PUBLIC ROUTES
  app.get('/api/about-company/info', AboutCompanyController.getCompanyInfo);

  // ADMIN ONLY ROUTES - Create company information (if none exists)
  app.post(
    '/api/about-company/info',

    AboutCompanyController.createCompanyInfo
  );

  // Update company information
  app.put(
    '/api/about-company/info',

    AboutCompanyController.updateCompanyInfo
  );

  // Upload company logo
  app.post(
    '/api/about-company/logo',
    upload.single('logo'),
    AboutCompanyController.uploadLogo
  );

  // Team management
  app.post(
    '/api/about-company/team',

    AboutCompanyController.addTeamMember
  );

  app.delete(
    '/api/about-company/team/:memberId',

    AboutCompanyController.removeTeamMember
  );

  // Gallery management
  app.post(
    '/api/about-company/gallery',

    upload.single('image'),
    AboutCompanyController.uploadGalleryImage
  );

  app.delete(
    '/api/about-company/gallery/:imageIndex',

    AboutCompanyController.removeGalleryImage
  );

  // Achievement management
  app.post(
    '/api/about-company/achievements',
    AboutCompanyController.addAchievement
  );

  app.delete(
    '/api/about-company/achievements/:achievementId',
    AboutCompanyController.removeAchievement
  );
  
  // Business hours management
  app.post(
    '/api/about-company/business-hours',
    AboutCompanyController.addBusinessHour
  );
  
  app.put(
    '/api/about-company/business-hours/:hourId',
    AboutCompanyController.updateBusinessHour
  );
};
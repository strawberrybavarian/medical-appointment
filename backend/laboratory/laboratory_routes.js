const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LaboratoryController = require('./laboratory_controller');
// Define where the files will be stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const dir = path.join(__dirname, '../public/uploads');
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});

// Set up file filtering (only allow PDF files)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
      cb(null, true);
  } else {
      cb(new Error('Only PDF files are allowed'), false);
  }
};

// Initialize multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Export routes for file upload
module.exports = app => {
  app.post('/api/doctor/api/createLaboratoryResult/:patientId/:appointmentId', upload.single('file'), LaboratoryController.createLaboratoryResult);
  app.get('/api/doctor/api/laboratoryResult/download/:resultId', LaboratoryController.downloadLaboratoryFile);
  app.get("/api/laboratory/getbyappointment/:appointmentID", LaboratoryController.getLaboratoryByAppointmentID);
};

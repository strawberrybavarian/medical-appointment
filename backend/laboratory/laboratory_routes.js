const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LaboratoryController = require('./laboratory_controller')
console.log("Laboratory routes connected");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save files in the public/uploads folder
        const dir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Use timestamp and original filename for saving
        cb(null, Date.now() + '-' + file.originalname);
    }
});
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX MIME type
    ) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  };
  


const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = app => {
    app.post('/doctor/api/createLaboratoryResult/:patientId/:appointmentId', upload.single('file'), LaboratoryController.createLaboratoryResult);
    app.get('/doctor/api/laboratoryResult/download/:resultId', LaboratoryController.downloadLaboratoryFile);

};
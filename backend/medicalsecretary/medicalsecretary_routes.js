const MSController = require ('./medicalsecretary_controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const { validationResult } = require('express-validator');
console.log("Medical Secretary routes connected");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'images');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  };
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });
  
module.exports = app => { 

    app.put('/api/medicalsecretary/api/:msid/update', upload.single('image'), MSController.updateMedicalSecretary);
    app.get('/api/medicalsecretary/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.put('/api/medicalsecretary/api/change-password/:msid', MSController.changePassword);
    //For Registration
    app.post('/api/medicalsecretary/api/signup', MSController.NewMedicalSecretarySignUp);
 
    //For LogIn
    app.get('/api/medicalsecretary/api/allmedicalsecretary', MSController.findAllMedicalSecretary);

    //Get All Appointment
    app.get('/api/medicalsecretary/api/allappointments', MSController.getAllAppointments);
    app.put('/api/medicalsecretary/api/:uid/ongoing', MSController.ongoingAppointment);
    app.put('/api/api/appointment/:id/assign', MSController.assignAppointment);

    //Patient Statistic
    app.get('/api/medicalsecretary/api/patient-stats', MSController.getPatientStats);
    app.get('/api/medicalsecretary/api/findone/:msid', MSController.findMedSecById)

    app.post('/api/notifications/general', MSController.createGeneralNotification);

}

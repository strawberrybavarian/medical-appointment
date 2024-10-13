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

    app.put('/medicalsecretary/api/:msid/update', upload.single('image'), MSController.updateMedicalSecretary);
    app.get('/medicalsecretary/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/medicalsecretary/api/change-password/:msid', MSController.changePassword);
    //For Registration
    app.post('/medicalsecretary/api/signup', MSController.NewMedicalSecretaryignUp);
 
    //For LogIn
    app.get('/medicalsecretary/api/allmedicalsecretary', MSController.findAllMedicalSecretary);

    //Get All Appointment
    app.get('/medicalsecretary/api/allappointments', MSController.getAllAppointments);
    app.put('/medicalsecretary/api/:uid/ongoing', MSController.ongoingAppointment);
    app.put('/api/appointment/:id/assign', MSController.assignAppointment);

    //Patient Statistic
    app.get('/medicalsecretary/api/patient-stats', MSController.getPatientStats);
    app.get('/medicalsecretary/api/findone/:msid', MSController.findMedSecById)



}

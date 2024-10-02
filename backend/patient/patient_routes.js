const PatientController = require ('../patient/patient_controller');
// const { validationResult } = require('express-validator');
console.log("Patient routes connected");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { applyDefaults } = require('../prescription/prescription_model');
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
    app.post('/patient/api/:id/updateimage', upload.single('image'), PatientController.updatePatientImage);
    app.get('/patient/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/api/patient/session', PatientController.createPatientSession);
    //New Patient Sign Up
    app.post('/patient/api/signup', PatientController.NewPatientSignUp);
    //
    app.post(`/patient/api/unregistered`, PatientController.createUnregisteredPatient);
    
    app.put('/patient/api/update/:pid', PatientController.updatePatientStatus);
    app.post('/patient/api/change-password/:pid', PatientController.changePatientPassword);
    app.put('/patient/api/updateinfo/:pid', PatientController.updatePatientInfo);


    app.post('/patient/api/setup-2fa/:id', PatientController.setupTwoFactor);
    app.post('/patient/api/verify-2fa', PatientController.verifyTwoFactor);

    
        //For Email OTP
    app.post('/patient/send-otp', PatientController.sendOTP);
    app.post('/patient/verify-otp', PatientController.verifyOTP);

    //Patient Log In
    app.get('/patient/api/allpatient', PatientController.findAllPatient);

    //Finding One Patient and Notifications
    app.get('/patient/api/onepatient/:uid', PatientController.findPatientById)
    
    
    // Appointment
    app.get('/doctor/:doctorId/booked-slots', PatientController.bookedSlots)
    // app.post('/patient/api/:uid/createappointment', PatientController.createAppointment);
    app.put('/patient/api/:uid/updateappointment', PatientController.cancelAppointment)
        // app.put('patient/api/:uid/rescheduleappointment', PatientController.resche)


    

}

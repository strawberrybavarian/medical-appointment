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
    //For Logging In
    app.get('/api/patient/getallemails', PatientController.getAllPatientEmails); 
    app.get('/api/patient/getcontactnumber', PatientController.getAllContactNumbers); 
    app.post('/api/patient/api/login', PatientController.loginPatient);
    //ResetPassword Forgot Password
    app.post('/api/patient/forgot-password', PatientController.forgotPassword);
    app.post('/api/patient/reset-password/:token', PatientController.resetPassword);
    
    //New Patient Sign Up with BCRYPT
    app.post('/api/patient/api/signup', PatientController.NewPatientSignUp);
    
    app.post('/api/patient/api/:id/updateimage', upload.single('image'), PatientController.updatePatientImage);
    app.get('/api/patient/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/api/patient/session', PatientController.createPatientSession);
    
    //
    app.post(`/api/patient/api/unregistered`, PatientController.createUnregisteredPatient);
    
    app.put('/api/patient/api/update/:pid', PatientController.updatePatientStatus);
    app.post('/api/patient/api/change-password/:pid', PatientController.changePatientPassword);
    app.put('/api/patient/api/updateinfo/:pid', PatientController.updatePatientInfo);


    app.post('/api/patient/api/setup-2fa/:id', PatientController.setupTwoFactor);
    app.post('/api/patient/api/verify-2fa', PatientController.verifyTwoFactor);

    
        //For Email OTP
    app.post('/api/patient/api/send-otp', PatientController.sendOTP);
    app.post('/api/patient/api/verify-otp', PatientController.verifyOTP);

    //Patient Log In
    app.get('/api/patient/api/allpatient', PatientController.findAllPatient);

    //Finding One Patient and Notifications
    app.get('/api/patient/api/onepatient/:uid', PatientController.findPatientById)
    
    
    // Appointment
    app.get('/api/doctor/:doctorId/booked-slots', PatientController.bookedSlots)
    // app.post('/patient/api/:uid/createappointment', PatientController.createAppointment);
    app.put('/api/patient/:appointmentId/updateappointment', PatientController.cancelAppointment)
        // app.put('patient/api/:uid/rescheduleappointment', PatientController.resche)
    app.get('/api/patient/api/getaudit/:pid', PatientController.getPatientWithAudits);

    

}

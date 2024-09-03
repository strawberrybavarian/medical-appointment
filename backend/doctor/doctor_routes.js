const multer = require('multer');
const path = require('path');
const fs = require('fs');


const DoctorController = require('./doctor_controller');
console.log("Doctor routes connected");


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

  // Uploading Image
  app.post('/doctor/api/:id/updateimage', upload.single('image'), DoctorController.updateDoctorImage);

  //Activity Status
  app.put('/doctor/api/:id/logout', DoctorController.offlineActivityStatus);
  app.put('/doctor/:id/status', DoctorController.updateDoctorStatus);

  app.get('/doctor/api/test', (req, res) => { res.json({ message: "the api is working" }) });
  // For Registration
  app.post('/doctor/api/signup', DoctorController.NewDoctorSignUp);
  app.get('/doctor/one/:id', DoctorController.findOneDoctor )
  // For LogIn
  app.get('/doctor/api/alldoctor', DoctorController.findAllDoctors);
  app.post('/doctor/api/setup-2fa/:id', DoctorController.setupTwoFactorForDoctor);
  app.post('/doctor/api/verify-2fa', DoctorController.verifyTwoFactor);
  
  //Specialties
  app.get('/doctor/api/specialties', DoctorController.findUniqueSpecialties);
  //Email OTP
  app.post('/doctor/send-otp', DoctorController.sendOTP);
  app.post('/doctor/verify-otp', DoctorController.verifyOTP);
  //Update Information Details
  app.put('/doctor/api/:id/updateDetails', DoctorController.updateDoctorDetails);
  // For Post
  // app.post('/doctor/api/addpost/:id', DoctorController.addNewPostById);
  // app.get('/doctor/api/finduser/:id', DoctorController.findDoctorById);
  // app.get('/doctor/api/post/getallpost/:id', DoctorController.getAllPostbyId);
  // app.delete('/doctor/api/post/deletepost/:id/:index', DoctorController.findPostByIdDelete);
  // app.put('/doctor/api/post/updatepost/:id/:index', DoctorController.updatePostAtIndex);

  // For Appointments
  app.put('/doctor/api/:uid/acceptpatient', DoctorController.acceptPatient)
  app.get('/doctor/appointments/:doctorId', DoctorController.getAllAppointments);
  app.put('/doctor/api/:appointmentID/completeappointment', DoctorController.completeAppointment)
  app.put('/doctor/:doctorId/availability', DoctorController.doctorAvailability)
  app.put('/doctor/:doctorId/status', DoctorController.updateAvailability);
 

  app.get('/doctor/:doctorId/available', DoctorController.getAvailability);
  app.put('/doctor/:uid/rescheduleappointment', DoctorController.rescheduleAppointment);

  app.put('/doctor/:uid/rescheduledstatus', DoctorController.rescheduledStatus);
  
  
  //For Prescription
  // app.post('/doctor/api/createPrescription/:patientId/:appointmentId', DoctorController.createPrescription);
  app.get('/doctor/api/getPrescriptions/:doctorId', DoctorController.getPrescriptionsByDoctor);
  app.get('/doctor/api/getPrescriptions/:patiendId/:doctorId', DoctorController.getPrescriptions);

  //Getting All Patients
  app.get('/doctor/api/getallpatients/:doctorId', DoctorController.getPatientsByDoctor);

};

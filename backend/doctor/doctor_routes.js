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

 
  //Biography
  app.get('/api/doctor/:id/gethmo', DoctorController.getDoctorHmo);
  app.put('/api/doctor/api/:id/updatebiography', DoctorController.updateDoctorBiography);  // Update Biography
  app.get('/api/doctor/:id/getbiography', DoctorController.getDoctorBiography);      // Get Biography
  app.delete('/api/doctor/:id/deletebiography', DoctorController.deleteDoctorBiography); // Delete Biography
  // Uploading Image
  app.post('/api/doctor/api/:id/updateimage', upload.single('image'), DoctorController.updateDoctorImage);
  app.get('/api/doctor/:id', DoctorController.findOneDoctor);
  //Activity Status
  app.put('/api/doctor/api/:id/logout', DoctorController.offlineActivityStatus);


  
  // For Registration
  app.post('/api/doctor/api/signup', DoctorController.NewDoctorSignUp);
  app.get('/api/doctor/one/:id', DoctorController.findOneDoctor )
  // For LogIn
  
  app.post('/api/doctor/forgot-password', DoctorController.forgotPassword);
  app.post('/api/doctor/reset-password/:token', DoctorController.resetPassword);
  app.get('/api/doctor/get/session', DoctorController.getSessionData);
  app.post('/api/doctor/session', DoctorController.createDoctorSession);
  app.post('/api/doctor/api/login', DoctorController.loginDoctor);
  app.post('/api/doctor/logout/:id', DoctorController.logoutDoctor)
  app.get('/api/doctor/api/alldoctor', DoctorController.findAllDoctors);
  app.post('/api/doctor/api/setup-2fa/:id', DoctorController.setupTwoFactorForDoctor);
  app.post('/api/doctor/api/verify-2fa', DoctorController.verifyTwoFactor);
  
  //Specialties
  app.get('/api/doctor/api/specialties', DoctorController.findUniqueSpecialties);
  //Email OTP
  app.post('/api/doctor/send-otp', DoctorController.sendOTP);
  app.post('/api/doctor/verify-otp', DoctorController.verifyOTP);
  //Update Information Details
  app.put('/api/doctor/api/:id/updateDetails', DoctorController.updateDoctorDetails);


  // For Appointments
  app.put('/api/doctor/api/:uid/acceptpatient', DoctorController.acceptPatient)
  app.get('/api/doctor/appointments/:doctorId', DoctorController.getAllAppointments);
  app.put('/api/doctor/api/:appointmentID/completeappointment', DoctorController.completeAppointment)
  app.put('/api/doctor/:doctorId/availability', DoctorController.doctorAvailability)
  app.put('/api/doctor/:doctorId/appointmentstatus', DoctorController.updateAvailability);
  app.post('/api/doctor/:doctorId/request-deactivation', DoctorController.requestDeactivation);

  app.get('/api/doctor/:doctorId/available', DoctorController.getAvailability);
  app.put('/api/doctor/:uid/rescheduleappointment', DoctorController.rescheduleAppointment);
  app.get('/api/doctor/:doctorId/appointments', DoctorController.specificAppointmentsforDoctor)
  app.put('/api/doctor/:uid/rescheduledstatus', DoctorController.rescheduledStatus);
  
  
  //For Prescription
  // app.post('/doctor/api/createPrescription/:patientId/:appointmentId', DoctorController.createPrescription);
  app.get('/api/doctor/api/getPrescriptions/:doctorId', DoctorController.getPrescriptionsByDoctor);
  app.get('/api/doctor/api/getPrescriptions/:patiendId/:doctorId', DoctorController.getPrescriptions);

  //Getting All Patients
  app.get('/api/doctor/api/getallpatients/:doctorId', DoctorController.getPatientsByDoctor);
  app.get('/api/doctor/getallemailss', DoctorController.getAllDoctorEmails); 
  app.get('/api/doctor/getallemails', DoctorController.getAllDoctorEmailse); 
  app.get('/api/doctor/getcontactnumbers', DoctorController.getAllContactNumbers);
  app.get('/api/doctor/:doctorId/slots', DoctorController.getDoctorSlots);
  app.put('/api/doctor/:doctorId/uslots', DoctorController.updateDoctorSlots);
  app.put('/api/doctor/api/:id/changePassword', DoctorController.changeDoctorPassword);
  app.put('/api/doctor/update-password/:doctorId', DoctorController.updateDoctorPassword);
};

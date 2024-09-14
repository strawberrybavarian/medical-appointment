const PatientController = require ('../patient/patient_controller');
// const { validationResult } = require('express-validator');
console.log("Patient routes connected");




module.exports = app => { 
    app.get('/patient/api/test',(req,res)=>{res.json({message:"the api is working"})});
    
    //New Patient Sign Up
    app.post('/patient/api/signup', PatientController.NewPatientSignUp);
    //
    app.post(`/patient/api/unregistered`, PatientController.createUnregisteredPatient);
    
    
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
    app.get('/patient/api/:uid/allappt', PatientController.findAllAppointmentsForPatient)
    app.get('/patient/api/:uid/oneappt/:id', PatientController.findAppointmentByIdForPatient)

        // app.put('patient/api/:uid/rescheduleappointment', PatientController.)


    

}

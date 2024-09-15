const AdminController = require('./admin_controller');
const AdminCountControllerDoctor = require('./counting/admin_countcontroller')
console.log('Admin Routes Connected')

module.exports = app => {
    app.post('/admin/api/signup', AdminController.NewAdminSignUp)
    app.get('/admin/api/alladmin', AdminController.findAllAdmin)

    //For Doctors
    app.put('/admin/api/doctor/account-status/:doctorId', AdminController.updateDoctorAccountStatus);

    //For Patients
    app.put('/admin/patient/account-status/:patientId', AdminController.updatePatientAccountStatus);
    //Counting Patients
    app.get('/admin/api/patients/count', AdminCountControllerDoctor.countTotalPatients);
    app.get('/admin/api/patients/registered/count', AdminCountControllerDoctor.countRegisteredPatients);
    app.get('/admin/api/patients/unregistered/count', AdminCountControllerDoctor.countUnregisteredPatients);
    app.get('/admin/api/appointments/stats', AdminController.getAppointmentStats);

    //Counting Doctors
    app.get('/admin/api/doctors/count', AdminCountControllerDoctor.countTotalDoctors)
    app.get('/admin/api/doctors/registered/count', AdminCountControllerDoctor.countRegisteredDoctors)
    app.get('/admin/api/doctors/reviewed/count', AdminCountControllerDoctor.countReviewedDoctors)
    //Appointment Stats
    app.get('/api/doctor-specialty-stats', AdminController.getDoctorSpecialtyStats)
    app.get('/admin/api/appointments/completed-by-month', AdminController.getCompletedAppointmentsByMonth)
    
    //For Deactivation of Appointment
    app.get('/admin/deactivation-requests', AdminController.getDeactivationRequests);
    app.post('/admin/confirm-deactivation/:doctorId', AdminController.confirmDeactivation);
    



}
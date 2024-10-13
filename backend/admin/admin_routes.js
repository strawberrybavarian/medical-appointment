const AdminController = require('./admin_controller');
const AdminCountControllerDoctor = require('./counting/admin_countcontroller')
console.log('Admin Routes Connected')

module.exports = app => {

    app.get('/api/admin/api/staff/all', AdminController.getAllStaff);
    app.put('/api/admin/api/staff/account-status/:id', AdminController.updateStaffAccountStatus);
    
    app.post('/api/admin/api/signup', AdminController.adminSignUp);

    // Admin change password route
    app.put('/api/admin/api/change-password/:adminId', AdminController.changeAdminPassword);
    app.get('/api/admin/api/alladmin', AdminController.findAllAdmin)

    //For Doctors
    app.put('/api/admin/api/doctor/account-status/:doctorId', AdminController.updateDoctorAccountStatus);

    //For Patients
    app.put('/api/admin/patient/account-status/:patientId', AdminController.updatePatientAccountStatus);
    //Counting Patients
    app.get('/api/admin/api/patients/count', AdminCountControllerDoctor.countTotalPatients);
    app.get('/api/admin/api/patients/registered/count', AdminCountControllerDoctor.countRegisteredPatients);
    app.get('/api/admin/api/patients/unregistered/count', AdminCountControllerDoctor.countUnregisteredPatients);
    app.get('/api/admin/api/appointments/stats', AdminController.getAppointmentStats);

    //Counting Doctors
    app.get('/api/admin/api/doctors/count', AdminCountControllerDoctor.countTotalDoctors)
    app.get('/api/admin/api/doctors/registered/count', AdminCountControllerDoctor.countRegisteredDoctors)
    app.get('/api/admin/api/doctors/reviewed/count', AdminCountControllerDoctor.countReviewedDoctors)
    //Appointment Stats
    app.get('/api/api/doctor-specialty-stats', AdminController.getDoctorSpecialtyStats)
    app.get('/api/admin/api/appointments/completed-by-month', AdminController.getCompletedAppointmentsByMonth)
    
    //For Deactivation of Appointment
    app.get('/api/admin/deactivation-requests', AdminController.getDeactivationRequests);
    app.post('/api/admin/confirm-deactivation/:doctorId', AdminController.confirmDeactivation);
    



}
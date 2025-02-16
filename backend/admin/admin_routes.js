const AdminController = require('./admin_controller');
const AdminCountControllerDoctor = require('./counting/admin_countcontroller')
console.log('Admin Routes Connected')

module.exports = app => {
    app.get('/api/admin/deactivation-requests', AdminController.getDeactivationRequests);
    
    app.get('/api/admin/api/staff/all', AdminController.getAllStaff);
    app.put('/api/admin/api/staff/account-status/:id', AdminController.updateStaffAccountStatus);
    app.get('/api/admin/api/getaudit/:adminId', AdminController.getAdminWithAudits);
    app.post('/api/admin/api/signup', AdminController.adminSignUp);
    //Admin
    app.get('/api/admin/:adminId', AdminController.findAdminById);
    app.put('/api/admin/update-info/:adminId', AdminController.updateAdminInfo);
   
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
    app.get('/api/admin/api/patients/todays-patient/count', AdminCountControllerDoctor.countTodaysPatient)
    app.get('/api/admin/api/patients/ongoing-appointment/count', AdminCountControllerDoctor.countOngoingPatient)
    app.get('/api/admin/api/patients/age-group/count', AdminCountControllerDoctor.countPatientAgeGroup)
    //Counting Doctors
    app.get('/api/admin/api/doctors/count', AdminCountControllerDoctor.countTotalDoctors)
    app.get('/api/admin/api/doctors/registered/count', AdminCountControllerDoctor.countRegisteredDoctors)
    app.get('/api/admin/api/doctors/reviewed/count', AdminCountControllerDoctor.countReviewedDoctors)
    app.get('/api/admin/api/doctors/online-status/count', AdminCountControllerDoctor.countOnlineDoctors)
    app.get('/api/admin/api/doctors/online-status/count', AdminCountControllerDoctor.countOnlineDoctors)
    app.get('/api/admin/api/doctors/insession-status/count', AdminCountControllerDoctor.countInSessionDoctors)
    app.get('/api/admin/api/doctors/age-group/count', AdminCountControllerDoctor.countDoctorAgeGroup)
    //Appointment Stats
    app.get('/api/api/doctor-specialty-stats', AdminController.getDoctorSpecialtyStats)
    app.get('/api/admin/api/appointments/completed-by-month', AdminController.getCompletedAppointmentsByMonth)
    
    //For Deactivation of Appointment
   
    app.post('/api/admin/confirm-deactivation/:doctorId', AdminController.confirmDeactivation);
    
    app.post('/api/admin/change-password/pending/:adminId', AdminController.changePendingAdminPassword); 


}
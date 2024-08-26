const AdminController = require('./admin_controller');
console.log('Admin Routes Connected')

module.exports = app => {
    app.post('/admin/api/signup', AdminController.NewAdminSignUp)
    app.get('/admin/api/alladmin', AdminController.findAllAdmin)

    //Counting Patients
    app.get('/admin/api/patients/count', AdminController.countTotalPatients);
    app.get('/admin/api/patients/registered/count', AdminController.countRegisteredPatients);

    app.get('/admin/api/patients/unregistered/count', AdminController.countUnregisteredPatients);
    app.get('/admin/api/appointments/stats', AdminController.getAppointmentStats);

}
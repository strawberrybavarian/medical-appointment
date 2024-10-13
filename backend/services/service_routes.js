const ServicesController = require('./service_controller');

console.log('Service Routes Connected')

module.exports = app => {
    // app.post('/admin/api/signup', AdminController.NewAdminSignUp)
 
    app.post('/api/admin/add/services', ServicesController.createService);


    app.get('/api/admin/getall/services', ServicesController.getAllServices);
    

    app.get('/api/admin/services/:id', ServicesController.getServiceById);
    

    app.put('/api/admin/update/services/:id', ServicesController.updateService);
    

    app.delete('/api/admin/delete/services/:id', ServicesController.deleteService);

    app.post('/api/doctor/:doctorId/add-service/:serviceId', ServicesController.addServiceToDoctor); // Doctor adds a service they offer
    app.delete('/api/doctor/:doctorId/remove-service/:serviceId', ServicesController.removeServiceFromDoctor); // Doctor removes a service they offer
    app.get('/api/doctor/:doctorId/services-status', ServicesController.fetchDoctorServiceStatus);



}
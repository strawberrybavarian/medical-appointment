const ServicesController = require('./service_controller');

console.log('Service Routes Connected')

module.exports = app => {
    // app.post('/admin/api/signup', AdminController.NewAdminSignUp)
 
    app.post('/admin/add/services', ServicesController.createService);


    app.get('/admin/get/services', ServicesController.getAllServices);
    

    app.get('/admin/services/:id', ServicesController.getServiceById);
    

    app.put('/admin/update/services/:id', ServicesController.updateService);
    

    app.delete('/admin/delete/services/:id', ServicesController.deleteService);

    app.post('/doctor/:doctorId/add-service/:serviceId', ServicesController.addServiceToDoctor); // Doctor adds a service they offer
    app.delete('/doctor/:doctorId/remove-service/:serviceId', ServicesController.removeServiceFromDoctor); // Doctor removes a service they offer
    app.get('/doctor/:doctorId/services-status', ServicesController.fetchDoctorServiceStatus);



}
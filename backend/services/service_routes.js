const ServicesController = require('./service_controller');

console.log('Service Routes Connected')

module.exports = app => {
    // app.post('/admin/api/signup', AdminController.NewAdminSignUp)
 
    app.post('/admin/add/services', ServicesController.createService);

    // Route to get all services
    app.get('/admin/get/services', ServicesController.getAllServices);
    
    // Route to get a single service by ID
    app.get('/admin/services/:id', ServicesController.getServiceById);
    
    // Route to update a service by ID
    app.put('/admin/update/services/:id', ServicesController.updateService);
    
    // Route to delete a service by ID
    app.delete('/admin/delete/services/:id', ServicesController.deleteService);


}
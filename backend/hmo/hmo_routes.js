const HmoController = require('./hmo_controller');
const Hmo = require('./hmo_model');

console.log('Hmo Routes Connected')

module.exports = app => {
    app.post('/api/admin/add/hmo', HmoController.createHmo);
  app.get('/api/admin/getall/hmo', HmoController.getAllHmo);
  app.get('/api/admin/hmo/:id', HmoController.getHmoById);
  app.put('/api/admin/update/hmo/:id', HmoController.updateHmo);
  app.delete('/api/admin/delete/hmo/:id', HmoController.deleteHmo);

  // Doctor-HMO Association Routes
  app.post('/api/hmo/:hmoId/add-doctor/:doctorId', HmoController.addDoctorToHmo); // Add doctor to HMO
  app.delete('/api/hmo/:hmoId/remove-doctor/:doctorId', HmoController.removeDoctorFromHmo); // Remove doctor from HMO
  app.get('/api/hmo/:doctorId/doctors', HmoController.fetchHmoDoctors); // Get all doctors in an HMO
  app.get('/api/doctor/:doctorId/hmo-status', HmoController.fetchHmoDoctorsStatus);


}
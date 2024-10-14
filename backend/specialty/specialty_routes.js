const SpecialtyController = require('./specialty_controller');

console.log('Specialty Routes Connected')

module.exports = app => {
    app.post('/api/admin/specialty/add', SpecialtyController.addSpecialty);
    app.get('/api/admin/specialties', SpecialtyController.getSpecialties);
    app.put('/api/admin/specialty/update', SpecialtyController.updateSpecialty);
    app.delete('/api/admin/specialty/delete/:specialtyId', SpecialtyController.deleteSpecialty);



}
const SpecialtyController = require('./specialty_controller');

console.log('Specialty Routes Connected')

module.exports = app => {
    app.post('/admin/specialty/add', SpecialtyController.addSpecialty);
    app.get('/admin/specialties', SpecialtyController.getSpecialties);
    app.put('/admin/specialty/update', SpecialtyController.updateSpecialty);
    app.delete('/admin/specialty/delete/:specialtyId', SpecialtyController.deleteSpecialty);



}
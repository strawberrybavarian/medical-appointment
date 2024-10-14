
const FindingsController = require('./findings_controller');
console.log("Findings routes connected");


module.exports = app => {
    app.post('/api/createfindings', FindingsController.createFindings)
    app.get('/api/getfindings/:id', FindingsController.getOneFindings)
    app.put('/api/updatefindings/:id', FindingsController.updateFindings)
    app.delete('/api/deletefindings/:id', FindingsController.deleteFindings)

};

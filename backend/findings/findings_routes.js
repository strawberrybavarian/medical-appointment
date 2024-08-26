
const FindingsController = require('./findings_controller');
console.log("Findings routes connected");


module.exports = app => {
    app.post('/createfindings', FindingsController.createFindings)
    app.get('/getfindings/:id', FindingsController.getOneFindings)
    app.put('/updatefindings/:id', FindingsController.updateFindings)
    app.delete('/deletefindings/:id', FindingsController.deleteFindings)

};

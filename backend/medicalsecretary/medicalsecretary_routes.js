const MSController = require ('./medicalsecretary_controller');
// const { validationResult } = require('express-validator');
console.log("Medical Secretary routes connected");
module.exports = app => { 
    app.get('/medicalsecretary/api/test',(req,res)=>{res.json({message:"the api is working"})});

    //For Registration
    app.post('/medicalsecretary/api/signup', MSController.NewMedicalSecretaryignUp);
 
    //For LogIn
    app.get('/medicalsecretary/api/allmedicalsecretary', MSController.findAllMedicalSecretary);

    //Get All Appointment
    app.get('/medicalsecretary/api/allappointments', MSController.getAllAppointments);
    app.put('/medicalsecretary/api/:uid/ongoing', MSController.ongoingAppointment)

}

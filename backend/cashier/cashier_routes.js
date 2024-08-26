const CSController = require ('./cashier_controller');
// const { validationResult } = require('express-validator');
console.log("Cashier routes connected");
module.exports = app => { 
    app.get('/cashier/api/test',(req,res)=>{res.json({message:"the api is working"})});

    //For Registration
    app.post('/cashier/api/signup', CSController.NewCashierignUp);
 
    //For LogIn
    app.get('/cashier/api/allcashier', CSController.findAllCashier);

    // //Get All Appointment
    // app.get('/medicalsecretary/api/allappointments', CSController.getAllAppointments);
    app.put('/cashier/api/:uid/completed', CSController.completedAppointment)
    app.put('/cashier/api/:uid/inexact', CSController.inexactAppointment)

}

const UserController = require ('../user/user_controller');
// const { validationResult } = require('express-validator');

module.exports = app => { 
    app.get('/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/api/login', UserController.unifiedLogin);

    // GET /api/get/session => returns user + role
    app.get('/api/get/session', UserController.getSession);
  
    // POST /api/logout => clears the session
    app.post('/api/logout', UserController.unifiedLogout);

    //For Post
   
}

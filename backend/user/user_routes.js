const UserController = require ('../controllers/user_controller');
// const { validationResult } = require('express-validator');

module.exports = app => { 
    app.get('/api/test',(req,res)=>{res.json({message:"the api is working"})});
    app.post('/api/medapp/signup', UserController.NewUserSignUp);
    app.get('/api/medapp/allusers', UserController.findAllUsers);
    app.get('/api/medapp/user/:email', UserController.findUserByEmail);


    //For Post
    app.post('/api/medapp/addpost/:id', UserController.addNewPostById);
    app.get('/api/medapp/finduser/:id', UserController.findUserById);
    app.get('/api/medapp/post/getallpost/:id', UserController.getAllPostbyId);
    app.delete('/api/medapp/post/deletepost/:uid/:index', UserController.findPostByIdDelete);
    app.put('/api/medapp/post/updatepost/:id/:index', UserController.updatePostAtIndex);
}
